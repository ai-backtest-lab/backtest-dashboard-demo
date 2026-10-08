import { describe, it, expect } from "vitest";
import { runs } from "./data";
import { metrics, drawdown, filterTrades, sma } from "./metrics";
describe("synthetic accounting and research presentation", () => {
  it("reconciles every sample trade and final equity without private data", () => {
    for (const run of runs) {
      expect(run.dataKind).toBe("synthetic");
      for (const t of run.trades) {
        expect(t.grossPnl).toBeCloseTo(
          t.quantity * (t.exitPrice - t.entryPrice),
          5,
        );
        expect(t.netPnl).toBeCloseTo(t.grossPnl - t.fees - t.slippage, 5);
      }
      const m = metrics(run);
      expect(run.equity.at(-1)!.value).toBeCloseTo(
        run.initialCapital + m.netPnl,
        5,
      );
      expect(m.returnPct).toBeCloseTo((m.netPnl / run.initialCapital) * 100, 5);
      expect(m.totalCosts).toBeCloseTo(m.fees + m.slippage, 5);
    }
  });
  it("measures drawdown from the running peak, including initial capital", () => {
    drawdown([100, 110, 99, 121, 90], 100).forEach((value, i) =>
      expect(value).toBeCloseTo([0, 0, -10, 0, (90 / 121 - 1) * 100][i], 10),
    );
    for (const run of runs)
      expect(metrics(run).maxDrawdownPct).toBeCloseTo(
        Math.min(
          ...drawdown(
            run.equity.map((p) => p.value),
            run.initialCapital,
          ),
        ),
        6,
      );
  });
  it("handles an all-losing sample without pretending it has a profit factor gain", () => {
    const run = { ...runs[0], trades: [{ ...runs[0].trades[0], netPnl: -10 }] };
    expect(metrics(run).profitFactor).toBe(0);
    expect(metrics(run).winRate).toBe(0);
  });
  it("filters and sorts trades without changing the snapshot", () => {
    const before = JSON.stringify(runs[0].trades);
    const shown = filterTrades(runs[0].trades, "loss", "pnl");
    expect(shown.every((t) => t.netPnl < 0)).toBe(true);
    expect(shown.every((t, i) => !i || shown[i - 1].netPnl >= t.netPnl)).toBe(
      true,
    );
    expect(JSON.stringify(runs[0].trades)).toBe(before);
  });
  it("has no SMA200 value before 200 observations", () => {
    const result = sma(runs[0].candles, 200);
    expect(result).toHaveLength(101);
    expect(result[0].time).toBe(runs[0].candles[199].time);
    expect(result[0].value).toBeCloseTo(
      runs[0].candles.slice(0, 200).reduce((s, c) => s + c.close, 0) / 200,
    );
  });
});
