import type { Run, Trade } from "./data";
export function drawdown(values: number[], initial: number) {
  let peak = initial;
  return values.map((value) => {
    peak = Math.max(peak, value);
    return (value / peak - 1) * 100;
  });
}
export function metrics(run: Run) {
  const sum = (key: "netPnl" | "grossPnl" | "fees" | "slippage") =>
    run.trades.reduce((s, t) => s + t[key], 0);
  const wins = run.trades.filter((t) => t.netPnl > 0),
    losses = run.trades.filter((t) => t.netPnl < 0);
  const gains = wins.reduce((s, t) => s + t.netPnl, 0),
    loss = -losses.reduce((s, t) => s + t.netPnl, 0);
  return {
    netPnl: sum("netPnl"),
    grossPnl: sum("grossPnl"),
    fees: sum("fees"),
    slippage: sum("slippage"),
    totalCosts: sum("fees") + sum("slippage"),
    returnPct: (sum("netPnl") / run.initialCapital) * 100,
    winRate: run.trades.length ? (wins.length / run.trades.length) * 100 : 0,
    profitFactor: loss ? gains / loss : null,
    maxDrawdownPct: Math.min(
      0,
      ...drawdown(
        run.equity.map((p) => p.value),
        run.initialCapital,
      ),
    ),
    tradeCount: run.trades.length,
    expectancy: run.trades.length ? sum("netPnl") / run.trades.length : 0,
    exposure: run.assumptions.exposure * 100,
  };
}
export type TradeFilter = "all" | "win" | "loss";
export type TradeSort = "date" | "pnl";
export function filterTrades(
  trades: Trade[],
  filter: TradeFilter,
  sort: TradeSort,
) {
  return trades
    .filter(
      (t) =>
        filter === "all" || (filter === "win" ? t.netPnl > 0 : t.netPnl < 0),
    )
    .sort((a, b) =>
      sort === "pnl" ? b.netPnl - a.netPnl : a.entryTime - b.entryTime,
    );
}
export function sma(candles: Run["candles"], period: number) {
  let total = 0;
  return candles.flatMap((c, i) => {
    total += c.close;
    if (i >= period) total -= candles[i - period].close;
    return i >= period - 1 ? [{ time: c.time, value: total / period }] : [];
  });
}
