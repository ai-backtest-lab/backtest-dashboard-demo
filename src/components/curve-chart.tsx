"use client";
import { useEffect, useRef, useState } from "react";
import {
  createChart,
  BaselineSeries,
  AreaSeries,
  ColorType,
  type UTCTimestamp,
} from "lightweight-charts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Panel } from "./shared";
import { money, pct, type Run } from "@/lib/data";
export function CurveChart({
  run,
  kind = "equity",
}: {
  run: Run;
  kind?: "equity" | "drawdown";
}) {
  const host = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState("percent");
  const last = run.equity.at(-1)!;
  const amount =
    unit === "percent" ? last.returnPct : last.value - run.initialCapital;
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
      grid: { vertLines: { visible: false }, horzLines: { color: "#25332b" } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
      handleScroll: { vertTouchDrag: false },
      handleScale: { pinch: true, mouseWheel: true },
    });
    if (kind === "drawdown") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: "#d99488",
        topColor: "#d994882b",
        bottomColor: "#d9948803",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: { type: "custom", formatter: (v: number) => pct(v) },
      });
      series.setData(
        run.equity.map((p) => ({
          time: p.time as UTCTimestamp,
          value: p.drawdownPct,
        })),
      );
    } else {
      const series = chart.addSeries(BaselineSeries, {
        baseValue: { type: "price", price: 0 },
        topLineColor: "#66d49e",
        bottomLineColor: "#d99488",
        topFillColor1: "#66d49e24",
        topFillColor2: "#66d49e00",
        bottomFillColor1: "#d9948824",
        bottomFillColor2: "#d9948800",
        priceLineVisible: false,
        lastValueVisible: false,
        priceFormat: {
          type: "custom",
          formatter: (v: number) => (unit === "percent" ? pct(v) : money(v)),
        },
      });
      series.setData(
        run.equity.map((p) => ({
          time: p.time as UTCTimestamp,
          value:
            unit === "percent" ? p.returnPct : p.value - run.initialCapital,
        })),
      );
    }
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [run, kind, unit]);
  return (
    <Panel
      title={kind === "equity" ? "Equity curve" : "Drawdown path"}
      description={
        kind === "equity"
          ? "Synthetic daily marked-to-market equity, including estimated costs."
          : "Distance from the running equity peak. Values at or below zero."
      }
      action={
        kind === "equity" ? (
          <ToggleGroup
            value={[unit]}
            onValueChange={(values) => {
              if (values[0]) setUnit(String(values[0]));
            }}
            variant="outline"
            size="sm"
            aria-label="Equity unit"
          >
            <ToggleGroupItem value="percent">Return %</ToggleGroupItem>
            <ToggleGroupItem value="dollar">PnL $</ToggleGroupItem>
          </ToggleGroup>
        ) : undefined
      }
    >
      <div className="chart-summary">
        <span>
          {kind === "equity" ? "Curve ends at" : "Deepest sample drawdown"}
        </span>
        <strong>
          {kind === "equity"
            ? unit === "percent"
              ? pct(amount, true)
              : money(amount, true)
            : pct(Math.min(...run.equity.map((p) => p.drawdownPct)))}
        </strong>
      </div>
      <div
        ref={host}
        className={`curve-host ${kind}`}
        role="region"
        aria-label={`${kind} chart for ${run.name}. Synthetic data. ${kind === "equity" ? pct(last.returnPct, true) : pct(Math.min(...run.equity.map((p) => p.drawdownPct)))}`}
      />
      <p className="chart-help">
        Drag to explore · Scroll or pinch to zoom.{" "}
        <a href="https://www.tradingview.com/">Charts by TradingView</a>
      </p>
    </Panel>
  );
}
