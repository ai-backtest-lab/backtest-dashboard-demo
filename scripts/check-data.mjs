import fs from "node:fs";
import assert from "node:assert/strict";
const data = JSON.parse(fs.readFileSync("src/data/demo.json", "utf8"));
const close = (actual, expected) =>
  assert.ok(Math.abs(actual - expected) < 0.00002, `${actual} != ${expected}`);
assert.equal(data.provenance.kind, "synthetic");
assert.equal(data.runs.length, 3);
for (const run of data.runs) {
  assert.equal(run.dataKind, "synthetic");
  assert.equal(run.candles.length, 300);
  assert.equal(run.equity.length, run.candles.length);
  const byTime = new Map(run.candles.map((c) => [c.time, c]));
  run.candles.forEach((c, i) => {
    assert.ok(c.low > 0 && c.volume >= 0);
    assert.ok(
      c.high >= Math.max(c.open, c.close) && c.low <= Math.min(c.open, c.close),
    );
    if (i) assert.equal(c.time - run.candles[i - 1].time, 86400);
  });
  let cash = run.initialCapital;
  run.trades.forEach((t, i) => {
    assert.ok(t.entryTime < t.exitTime && t.quantity > 0);
    if (i) assert.ok(t.entryTime > run.trades[i - 1].exitTime);
    close(t.entryPrice, byTime.get(t.entryTime).close);
    close(t.exitPrice, byTime.get(t.exitTime).close);
    close(t.quantity, (cash * run.assumptions.exposure) / t.entryPrice);
    close(t.grossPnl, t.quantity * (t.exitPrice - t.entryPrice));
    close(
      t.fees,
      t.quantity *
        (t.entryPrice * (1 + run.assumptions.slippageRate) +
          t.exitPrice * (1 - run.assumptions.slippageRate)) *
        run.assumptions.feeRate,
    );
    close(
      t.slippage,
      t.quantity * (t.entryPrice + t.exitPrice) * run.assumptions.slippageRate,
    );
    close(t.netPnl, t.grossPnl - t.fees - t.slippage);
    close(t.returnPct, (t.netPnl / (t.quantity * t.entryPrice)) * 100);
    cash += t.netPnl;
  });
  let peak = run.initialCapital;
  run.equity.forEach((p, i) => {
    const c = run.candles[i];
    assert.equal(p.time, c.time);
    let expected = run.initialCapital;
    for (const t of run.trades) {
      if (t.exitTime <= p.time) expected += t.netPnl;
      else if (t.entryTime <= p.time) {
        expected += t.quantity * (c.close - t.entryPrice);
        expected -=
          t.quantity *
          (t.entryPrice * (1 + run.assumptions.slippageRate) +
            c.close * (1 - run.assumptions.slippageRate)) *
          run.assumptions.feeRate;
        expected -=
          t.quantity * (t.entryPrice + c.close) * run.assumptions.slippageRate;
      }
    }
    close(p.value, expected);
    close(p.returnPct, (p.value / run.initialCapital - 1) * 100);
    peak = Math.max(peak, p.value);
    close(p.drawdownPct, (p.value / peak - 1) * 100);
  });
  close(run.equity.at(-1).value, cash);
}
console.log(
  "PASS: 3 synthetic datasets, OHLCV, trade prices, costs, exposure, daily equity and drawdown reconcile.",
);
