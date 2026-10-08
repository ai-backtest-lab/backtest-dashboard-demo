"use client";
import { useState } from "react";
import { useDemo } from "./demo-context";
import {
  PageHeading,
  DataNotice,
  RunFacts,
  MetricStrip,
  Panel,
  ExploreLink,
} from "./shared";
import { PriceChart } from "./price-chart";
import { TradeTable } from "./trade-table";
import { CurveChart } from "./curve-chart";
import { money, pct, type Run, type Trade } from "@/lib/data";
import { metrics } from "@/lib/metrics";
function AnalysisRun({ run }: { run: Run }) {
  const [selected, setSelected] = useState<Trade | null>(null);
  const m = metrics(run);
  return (
    <>
      <RunFacts />
      <MetricStrip />
      <PriceChart run={run} selectedTrade={selected} />
      <div className="analysis-details">
        <Panel
          title="Costs & outcomes"
          description="All figures calculated from the synthetic trade log."
        >
          <dl className="facts-list">
            <div>
              <dt>Gross PnL</dt>
              <dd>{money(m.grossPnl, true)}</dd>
            </div>
            <div>
              <dt>Trading fees</dt>
              <dd>−{money(m.fees)}</dd>
            </div>
            <div>
              <dt>Slippage</dt>
              <dd>−{money(m.slippage)}</dd>
            </div>
            <div className="fact-total">
              <dt>Net PnL</dt>
              <dd className={m.netPnl >= 0 ? "positive" : "negative"}>
                {money(m.netPnl, true)}
              </dd>
            </div>
            <div>
              <dt>Average net trade</dt>
              <dd>{money(m.expectancy, true)}</dd>
            </div>
          </dl>
        </Panel>
        <Panel
          title="Risk & assumptions"
          description="A result only makes sense with its measurement assumptions."
        >
          <dl className="facts-list">
            <div>
              <dt>Sample exposure per entry</dt>
              <dd>{pct(m.exposure)}</dd>
            </div>
            <div>
              <dt>Fee per side</dt>
              <dd>{pct(run.assumptions.feeRate * 100)}</dd>
            </div>
            <div>
              <dt>Slippage per side</dt>
              <dd>{pct(run.assumptions.slippageRate * 100)}</dd>
            </div>
            <div>
              <dt>Price source</dt>
              <dd>Invented, no exchange</dd>
            </div>
            <div>
              <dt>Validation status</dt>
              <dd>Illustrative only</dd>
            </div>
          </dl>
          <p className="data-note">
            No out-of-sample test, funding, liquidation model or live execution.
            These samples illustrate analysis, not a validated strategy.
          </p>
        </Panel>
      </div>
      <TradeTable run={run} selectedTrade={selected} onSelect={setSelected} />
      <div className="analysis-details">
        <CurveChart run={run} />
        <CurveChart run={run} kind="drawdown" />
      </div>
      <div className="next-step">
        <p>What does this result suggest you should test next?</p>
        <ExploreLink href="/claude/">
          Explore planned Claude analysis
        </ExploreLink>
      </div>
    </>
  );
}
export function Analysis() {
  const { run } = useDemo();
  return (
    <div className="page-stack">
      <PageHeading
        kicker="Research / Backtest analysis"
        title="Every result has a path."
        description="Explore daily candles, sample entries and exits, risk metrics and the costs behind a result. No backtest is executed here."
      />
      <DataNotice />
      <AnalysisRun key={run.id} run={run} />
    </div>
  );
}
