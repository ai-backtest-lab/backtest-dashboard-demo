"use client";
import { ArrowRight } from "lucide-react";
import {
  PageHeading,
  DataNotice,
  MetricStrip,
  RunFacts,
  Panel,
  ExploreLink,
} from "./shared";
import { useDemo } from "./demo-context";
import { CurveChart } from "./curve-chart";
import { runs, pct, money } from "@/lib/data";
import { metrics } from "@/lib/metrics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
export function Overview() {
  const { run, selectRun } = useDemo();
  const m = metrics(run);
  return (
    <div className="page-stack">
      <PageHeading
        kicker="Research / Overview"
        title="See the evidence. Then ask why."
        description="Explore how a backtest becomes inspectable research — from the equity path to individual trades and the next question."
      />
      <DataNotice />
      <RunFacts />
      <MetricStrip />
      <div className="overview-charts">
        <CurveChart run={run} />
        <CurveChart run={run} kind="drawdown" />
      </div>
      <div className="overview-bottom">
        <Panel
          title="Explore a research sample"
          description="Three invented snapshots, three different risk profiles."
          action={<Badge variant="outline">3 samples</Badge>}
        >
          <div className="sample-list">
            {runs.map((r) => (
              <div className="sample-row" key={r.id}>
                <div>
                  <strong>{r.name}</strong>
                  <p>{r.summary}</p>
                </div>
                <div className="sample-row-stats">
                  <span
                    className={
                      metrics(r).returnPct >= 0 ? "positive" : "negative"
                    }
                  >
                    {pct(metrics(r).returnPct, true)}
                  </span>
                  <small>Synthetic return</small>
                </div>
                <Button
                  variant={r.id === run.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => selectRun(r.id)}
                  aria-pressed={r.id === run.id}
                  aria-label={`Select ${r.name}`}
                >
                  {r.id === run.id ? "Selected" : "Explore"}
                </Button>
              </div>
            ))}
          </div>
          <div className="panel-link">
            <ExploreLink href="/analysis/">Inspect this backtest</ExploreLink>
          </div>
        </Panel>
        <Panel
          title="From numbers to questions"
          description="A quantitative engine computes. Researchers interpret and test again."
        >
          <ol className="research-steps">
            <li>
              <span>01</span>
              <div>
                <strong>Inspect the result</strong>
                <p>
                  {m.tradeCount} predefined trades, net costs of{" "}
                  {money(m.totalCosts)}.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Understand the path</strong>
                <p>Check drawdowns, cost drag and trade concentration.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Form the next hypothesis</strong>
                <p>Claude-assisted interpretation is a planned extension.</p>
              </div>
            </li>
          </ol>
          <div className="panel-link">
            <ExploreLink href="/claude/">See the Claude concept</ExploreLink>
            <ArrowRight aria-hidden="true" className="flow-arrow" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
