import fs from "node:fs";
// All inputs are invented here. This script does not read private services or market sources.
const scenarios = [
  {
    id: "trend",
    name: "Trend research",
    symbol: "BTC / USD",
    base: 38000,
    drift: 62,
    amplitude: 1750,
    offset: 0,
    exposure: 0.28,
    summary: "A trend-shaped sample with uneven gains and several pullbacks.",
  },
  {
    id: "range",
    name: "Range research",
    symbol: "ETH / USD",
    base: 2200,
    drift: -1.15,
    amplitude: 165,
    offset: 7,
    exposure: 0.45,
    summary: "A choppy sample that highlights cost drag and losing trades.",
  },
  {
    id: "defensive",
    name: "Lower-exposure research",
    symbol: "BTC / USD",
    base: 38000,
    drift: 62,
    amplitude: 1750,
    offset: 0,
    exposure: 0.12,
    summary: "The same invented price path with less sample capital exposed.",
  },
];
const start = Date.UTC(2024, 0, 1) / 1000;
const round = (n) => Math.round(n * 1e8) / 1e8;
const runs = scenarios.map((s) => {
  const candles = Array.from({ length: 300 }, (_, i) => {
    const price = (j) =>
      s.base +
      s.drift * j +
      s.amplitude * Math.sin(j / 13) +
      s.amplitude * 0.25 * Math.sin(j / 3.7);
    const open = round(price(i - 1)),
      close = round(price(i)),
      spread = s.base * (0.005 + 0.002 * Math.abs(Math.sin(i * 1.3)));
    return {
      time: start + i * 86400,
      open,
      high: round(Math.max(open, close) + spread),
      low: round(Math.min(open, close) - spread),
      close,
      volume: Math.round(180 + 120 * Math.abs(Math.sin(i / 5)) + (i % 17) * 9),
    };
  });
  const initialCapital = 10000,
    feeRate = 0.001,
    slippageRate = 0.0003;
  let cash = initialCapital;
  const trades = [];
  for (let i = 15 + s.offset; i + 9 < 300; i += 16) {
    const entryPrice = candles[i].close,
      exitPrice = candles[i + 8].close;
    const quantity = round((cash * s.exposure) / entryPrice);
    const grossPnl = round(quantity * (exitPrice - entryPrice));
    const entryFill = entryPrice * (1 + slippageRate),
      exitFill = exitPrice * (1 - slippageRate);
    const fees = round(quantity * (entryFill + exitFill) * feeRate);
    const slippage = round(quantity * (entryPrice + exitPrice) * slippageRate);
    const netPnl = round(grossPnl - fees - slippage);
    trades.push({
      id: `${s.id}-${trades.length + 1}`,
      entryTime: candles[i].time,
      exitTime: candles[i + 8].time,
      side: "Long",
      entryPrice,
      exitPrice,
      quantity,
      grossPnl,
      fees,
      slippage,
      netPnl,
      returnPct: round((netPnl / (entryPrice * quantity)) * 100),
      exitReason: "Sample holding window",
    });
    cash += netPnl;
  }
  let peak = initialCapital;
  const equity = candles.map((c) => {
    const realized = trades
      .filter((t) => t.exitTime <= c.time)
      .reduce((a, t) => a + t.netPnl, 0);
    const open = trades.find(
      (t) => t.entryTime <= c.time && t.exitTime > c.time,
    );
    const openValue = open
      ? open.quantity * (c.close - open.entryPrice) -
        open.quantity *
          (open.entryPrice * (1 + slippageRate) +
            c.close * (1 - slippageRate)) *
          feeRate -
        open.quantity * (open.entryPrice + c.close) * slippageRate
      : 0;
    const value = round(initialCapital + realized + openValue);
    peak = Math.max(peak, value);
    return {
      time: c.time,
      value,
      returnPct: round((value / initialCapital - 1) * 100),
      drawdownPct: round((value / peak - 1) * 100),
    };
  });
  return {
    id: s.id,
    name: s.name,
    symbol: s.symbol,
    interval: "1 day",
    dataKind: "synthetic",
    summary: s.summary,
    initialCapital,
    assumptions: {
      feeRate,
      slippageRate,
      exposure: s.exposure,
      priceBasis: "Invented prices; no exchange data",
      equityBasis:
        "Daily marked-to-market equity after estimated liquidation costs",
      execution: "Predefined sample trades; no strategy execution",
      currency: "USD",
    },
    candles,
    trades,
    equity,
  };
});
const data = {
  schemaVersion: 1,
  provenance: {
    kind: "synthetic",
    label: "Synthetic demonstration data",
    generatedBy: "scripts/generate-data.mjs",
    source:
      "Invented deterministic prices and predefined trades. Not historical market data or recorded private backtests.",
    period: "2024-01-01 to 2024-10-26 (invented dates)",
    disclaimer:
      "All displayed returns are synthetic examples, not evidence of strategy profitability.",
  },
  runs,
};
fs.writeFileSync("src/data/demo.json", JSON.stringify(data, null, 2) + "\n");
console.log(
  `Generated ${runs.length} public synthetic snapshots; no private inputs.`,
);
