"use client";
import { useState } from "react";
import { ArrowRight, Sparkles, FileJson, Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useDemo } from "./demo-context";
import {
  PageHeading,
  DataNotice,
  Panel,
  RunFacts,
  ExploreLink,
} from "./shared";
import { money, pct, type Run } from "@/lib/data";
import { metrics } from "@/lib/metrics";
function Report({ run }: { run: Run }) {
  const m = metrics(run);
  const [copied, setCopied] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const evidence = JSON.stringify(
    {
      data_kind: "synthetic",
      sample: run.name,
      trade_count: m.tradeCount,
      net_return_pct: Number(m.returnPct.toFixed(4)),
      max_drawdown_pct: Number(m.maxDrawdownPct.toFixed(4)),
      fees_usd: Number(m.fees.toFixed(4)),
      slippage_usd: Number(m.slippage.toFixed(4)),
      assumptions: run.assumptions,
      limitations: [
        "Invented prices and trades",
        "No out-of-sample validation",
        "Not evidence of profitability",
      ],
    },
    null,
    2,
  );
  const questions = [
    {
      id: "risk",
      label: "Risk",
      question: "What could a headline return hide?",
      answer: `This synthetic path reaches a ${pct(m.maxDrawdownPct)} daily drawdown. A terminal return of ${pct(m.returnPct, true)} says little about losses along the way, trade concentration or a different market regime. A real report would need more evidence before drawing conclusions.`,
    },
    {
      id: "costs",
      label: "Costs",
      question: "How much do costs change the result?",
      answer: `Gross PnL is ${money(m.grossPnl, true)}. Fees of ${money(m.fees)} and slippage of ${money(m.slippage)} leave ${money(m.netPnl, true)} net. These are invented cost assumptions; a real study must also verify market-specific funding and execution constraints.`,
    },
    {
      id: "validation",
      label: "Next test",
      question: "Which hypothesis should we validate next?",
      answer:
        "Compare the same fixed hypothesis on an untouched time window, then stress cost assumptions and examine trade concentration. Record the test before running it. A plausible explanation is not a quantitative validation result.",
    },
  ];
  async function copy() {
    try {
      await navigator.clipboard.writeText(evidence);
      setCopied("Evidence JSON copied.");
    } catch {
      setCopied("Clipboard unavailable. Select and copy the JSON below.");
    }
  }
  return (
    <>
      <div className="claude-layout">
        <Panel
          title="The engine supplies the evidence"
          description="A public synthetic example of the structured input planned for Claude."
          action={<FileJson aria-hidden="true" />}
        >
          <dl className="facts-list">
            <div>
              <dt>Strategy context</dt>
              <dd>{run.name}</dd>
            </div>
            <div>
              <dt>Trade count</dt>
              <dd>{m.tradeCount}</dd>
            </div>
            <div>
              <dt>Net sample return</dt>
              <dd>{pct(m.returnPct, true)}</dd>
            </div>
            <div>
              <dt>Cost assumptions</dt>
              <dd>Fees + slippage</dd>
            </div>
            <div>
              <dt>Data limitations</dt>
              <dd>Explicitly supplied</dd>
            </div>
          </dl>
          <p className="data-note">
            The planned API receives analytical results and context, not
            exchange keys or trading authority.
          </p>
          <details className="evidence-json">
            <summary>Inspect planned input format</summary>
            <pre
              tabIndex={0}
              role="region"
              aria-label="Planned synthetic evidence JSON"
            >
              {evidence}
            </pre>
            <Button variant="outline" size="sm" onClick={copy}>
              <Copy data-icon="inline-start" />
              Copy evidence JSON
            </Button>
            <p role="status">{copied}</p>
          </details>
        </Panel>
        <Panel
          title="Illustrative research report"
          description="Written example template using synthetic metrics. Not a Claude API response."
          action={<Badge variant="secondary">Planned integration</Badge>}
        >
          <div className="report-section">
            <span className="report-number">01 / Performance context</span>
            <h2>A result is a starting point.</h2>
            <p>
              The sample ends at {pct(m.returnPct, true)} after costs across{" "}
              {m.tradeCount} predefined trades.{" "}
              {m.netPnl >= 0
                ? "A positive sample result does not establish an edge."
                : "A negative sample result shows why a workflow must make weaknesses visible."}
            </p>
          </div>
          <div className="report-section">
            <span className="report-number">02 / Risk interpretation</span>
            <h3>Read the path, not just the endpoint.</h3>
            <p>
              Daily drawdown reaches {pct(m.maxDrawdownPct)}. Fees and slippage
              total {money(m.totalCosts)}. The sample cannot tell us how a
              strategy behaves with different data, costs or execution
              assumptions.
            </p>
          </div>
          <div className="report-section">
            <span className="report-number">03 / Research hypothesis</span>
            <h3>Test whether the observation holds.</h3>
            <p>
              A candidate question: does the same approach remain stable in an
              untouched sample with higher trading costs? Define the experiment
              first; the quantitative engine, not the explanation, must
              determine its outcome.
            </p>
          </div>
        </Panel>
      </div>
      <div className="claude-lower">
        <Panel
          title="Research assistant concept"
          description="Choose a question to explore a written example. No AI request is sent."
          action={<Sparkles aria-hidden="true" />}
        >
          <Tabs defaultValue="risk">
            <TabsList aria-label="Research question topics">
              {questions.map((q) => (
                <TabsTrigger key={q.id} value={q.id}>
                  {q.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {questions.map((q) => (
              <TabsContent key={q.id} value={q.id}>
                <div className="question-answer">
                  <h3>{q.question}</h3>
                  <p>{q.answer}</p>
                  <Badge variant="outline">Illustrative answer</Badge>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Panel>
        <Panel
          title="Further validation"
          description="A local research checklist, not an executed test or verdict."
          action={<Badge variant="outline">{checked.length}/3 noted</Badge>}
        >
          <div className="validation-checklist">
            {[
              "Define an untouched evaluation window",
              "Stress fees and slippage assumptions",
              "Review concentration and losing trades",
            ].map((text, i) => (
              <label key={text} className="checklist-item">
                <Checkbox
                  checked={checked.includes(text)}
                  onCheckedChange={(value) =>
                    setChecked((items) =>
                      value
                        ? [...items, text]
                        : items.filter((item) => item !== text),
                    )
                  }
                  id={`check-${i}`}
                />
                <span>{text}</span>
              </label>
            ))}
          </div>
          <p className="data-note">
            Checking an item only records your choice during this visit. This
            demo never executes validation or trades.
          </p>
          <ExploreLink href="/analysis/">Return to the evidence</ExploreLink>
        </Panel>
      </div>
    </>
  );
}
export function ClaudePreview() {
  const { run } = useDemo();
  return (
    <div className="page-stack">
      <PageHeading
        kicker="Research / Claude preview"
        title="Interpret. Question. Validate."
        description="Explore how Anthropic’s Claude API is planned to help researchers explain performance, understand risk and form testable hypotheses."
      />
      <DataNotice />
      <RunFacts />
      <div className="planned-banner">
        <Sparkles aria-hidden="true" />
        <div>
          <strong>Claude API · Planned integration</strong>
          <p>
            The integration is not implemented. All reports and answers below
            are illustrative templates, not live AI responses.
          </p>
        </div>
        <Check aria-hidden="true" />
      </div>
      <ol className="ai-workflow">
        {[
          "Backtest results",
          "Claude analysis",
          "Risk explanation",
          "Research hypotheses",
          "Further validation",
        ].map((step, i) => (
          <li key={step}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            {step}
            {i < 4 && <ArrowRight aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <Report key={run.id} run={run} />
    </div>
  );
}
