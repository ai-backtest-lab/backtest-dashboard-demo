"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  ColorType,
  createSeriesMarkers,
  type IChartApi,
  type LogicalRange,
  type UTCTimestamp,
} from "lightweight-charts";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "./shared";
import { date, money, type Run, type Trade } from "@/lib/data";
import { sma } from "@/lib/metrics";
export function PriceChart({
  run,
  selectedTrade,
}: {
  run: Run;
  selectedTrade: Trade | null;
}) {
  const host = useRef<HTMLDivElement>(null),
    api = useRef<IChartApi | null>(null),
    range = useRef<LogicalRange | null>(null);
  const [indicators, setIndicators] = useState<string[]>(["volume"]);
  const [visible, setVisible] = useState(
    `${date(run.candles[0].time)} — ${date(run.candles.at(-1)!.time)}`,
  );
  const last = run.candles.at(-1)!;
  const [hover, setHover] = useState({
    time: last.time,
    open: last.open,
    high: last.high,
    low: last.low,
    close: last.close,
  });
  useEffect(() => {
    if (!host.current) return;
    const chart = createChart(host.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#111813" },
        textColor: "#a1ada6",
        fontFamily: "Geist, sans-serif",
        attributionLogo: true,
      },
      grid: {
        vertLines: { color: "#25332b" },
        horzLines: { color: "#25332b" },
      },
      rightPriceScale: {
        borderColor: "#25332b",
        scaleMargins: { top: 0.12, bottom: 0.23 },
      },
      timeScale: { borderColor: "#25332b", minBarSpacing: 0.4 },
      handleScroll: { vertTouchDrag: false, horzTouchDrag: true },
      handleScale: { mouseWheel: true, pinch: true },
    });
    api.current = chart;
    const prices = chart.addSeries(CandlestickSeries, {
      upColor: "#66d49e",
      downColor: "#d99488",
      wickUpColor: "#66d49e",
      wickDownColor: "#d99488",
      borderVisible: false,
      priceLineVisible: false,
    });
    prices.setData(
      run.candles.map((c) => ({ ...c, time: c.time as UTCTimestamp })),
    );
    createSeriesMarkers(
      prices,
      run.trades
        .flatMap((t, i) => [
          {
            time: t.entryTime as UTCTimestamp,
            position: "belowBar" as const,
            color: "#66d49e",
            shape: "arrowUp" as const,
            text: `${i + 1}`,
          },
          {
            time: t.exitTime as UTCTimestamp,
            position: "aboveBar" as const,
            color: "#d99488",
            shape: "arrowDown" as const,
            text: "Exit",
          },
        ])
        .sort((a, b) => a.time - b.time),
    );
    if (indicators.includes("volume")) {
      const volume = chart.addSeries(HistogramSeries, {
        priceScaleId: "volume",
        priceFormat: { type: "volume" },
        priceLineVisible: false,
        lastValueVisible: false,
      });
      volume
        .priceScale()
        .applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      volume.setData(
        run.candles.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.volume,
          color: c.close >= c.open ? "#66d49e45" : "#d9948845",
        })),
      );
    }
    if (indicators.includes("ma")) {
      const ma = chart.addSeries(LineSeries, {
        color: "#c3b58b",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      ma.setData(
        sma(run.candles, 200).map((p) => ({
          ...p,
          time: p.time as UTCTimestamp,
        })),
      );
    }
    chart.subscribeCrosshairMove((param) => {
      const candle = param.seriesData.get(prices);
      if (candle && "open" in candle && typeof param.time === "number")
        setHover({
          time: param.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        });
    });
    chart.timeScale().subscribeVisibleLogicalRangeChange((r) => {
      range.current = r;
    });
    chart.timeScale().subscribeVisibleTimeRangeChange((r) => {
      if (r && typeof r.from === "number" && typeof r.to === "number")
        setVisible(`${date(r.from)} — ${date(r.to)}`);
    });
    if (range.current) chart.timeScale().setVisibleLogicalRange(range.current);
    else chart.timeScale().fitContent();
    return () => {
      api.current = null;
      chart.remove();
    };
  }, [run, indicators]);
  useEffect(() => {
    if (selectedTrade && api.current)
      api.current
        .timeScale()
        .setVisibleRange({
          from: (selectedTrade.entryTime - 14 * 86400) as UTCTimestamp,
          to: (selectedTrade.exitTime + 14 * 86400) as UTCTimestamp,
        });
  }, [selectedTrade]);
  function zoom(factor: number) {
    const scale = api.current?.timeScale(),
      r = scale?.getVisibleLogicalRange();
    if (scale && r) {
      const mid = (r.from + r.to) / 2,
        half = Math.max(5, ((r.to - r.from) * factor) / 2);
      scale.setVisibleLogicalRange({ from: mid - half, to: mid + half });
    }
  }
  return (
    <Panel
      title="Price & trade exploration"
      description={`${run.symbol} · Daily candles · Invented prices and predefined sample trades`}
      action={
        <div className="chart-buttons">
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(0.65)}
            aria-label="Zoom in"
          >
            <ZoomIn />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(1.5)}
            aria-label="Zoom out"
          >
            <ZoomOut />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => api.current?.timeScale().fitContent()}
          >
            <RotateCcw data-icon="inline-start" />
            Reset view
          </Button>
        </div>
      }
    >
      <div className="price-toolbar">
        <p className="ohlc-readout">
          {date(hover.time)}{" "}
          <span>
            O {money(hover.open)} · H {money(hover.high)} · L {money(hover.low)}{" "}
            · C {money(hover.close)}
          </span>
        </p>
        <ToggleGroup
          multiple
          value={indicators}
          onValueChange={(values) => setIndicators(values.map(String))}
          variant="outline"
          size="sm"
          aria-label="Chart indicators"
        >
          <ToggleGroupItem value="volume">Volume</ToggleGroupItem>
          <ToggleGroupItem value="ma">SMA200</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div
        ref={host}
        className="price-host"
        role="region"
        aria-label="Synthetic candlestick chart. Green up candles and pink down candles; arrows mark sample entries and exits."
      />
      <div className="chart-help">
        <span data-testid="chart-range">Visible: {visible}</span>
        <span>Drag to pan · Scroll/pinch to zoom · Select a trade below</span>
      </div>
      <p className="data-note">
        SMA200 begins after 200 daily observations. Volume is synthetic.{" "}
        <a href="https://www.tradingview.com/">Charts by TradingView</a>
      </p>
    </Panel>
  );
}
