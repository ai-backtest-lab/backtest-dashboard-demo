"use client";
import type { ReactNode } from "react";
import { Info, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { buttonVariants } from "@/components/ui/button";
import { useDemo } from "./demo-context";
import { runs, money, pct } from "@/lib/data";
import { metrics } from "@/lib/metrics";
export function Panel({
  title,
  description,
  children,
  action,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="panel-heading">
          <CardTitle>
            <h2>{title}</h2>
          </CardTitle>
          {action}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
export function PageHeading({
  title,
  description,
  kicker,
}: {
  title: string;
  description: string;
  kicker: string;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <RunSelector />
    </div>
  );
}
export function RunSelector() {
  const { run, selectRun } = useDemo();
  return (
    <div className="run-selector">
      <label htmlFor="sample-select">Strategy sample</label>
      <NativeSelect
        id="sample-select"
        value={run.id}
        onChange={(e) => selectRun(e.target.value)}
      >
        {runs.map((r) => (
          <NativeSelectOption key={r.id} value={r.id}>
            {r.name} · {r.symbol}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </div>
  );
}
export function DataNotice() {
  return (
    <Alert className="data-notice">
      <Info />
      <AlertTitle>Synthetic demonstration data</AlertTitle>
      <AlertDescription>
        Prices, trades and returns are invented examples dated in 2024, not
        recorded backtests or historical market data. Explore the workflow;
        these numbers do not demonstrate profitability.
      </AlertDescription>
    </Alert>
  );
}
export function MetricStrip() {
  const { run } = useDemo();
  const m = metrics(run);
  const items = [
    {
      name: "Net return",
      value: pct(m.returnPct, true),
      sub: "After sample costs",
      tone: m.returnPct >= 0 ? "positive" : "negative",
    },
    {
      name: "Max drawdown",
      value: pct(m.maxDrawdownPct),
      sub: "Daily marked-to-market",
      tone: "neutral",
    },
    {
      name: "Win rate",
      value: pct(m.winRate),
      sub: `${m.tradeCount} sample trades`,
      tone: "neutral",
    },
    {
      name: "Profit factor",
      value: m.profitFactor === null ? "No losses" : m.profitFactor.toFixed(2),
      sub: "Net gains / net losses",
      tone: "neutral",
    },
  ];
  return (
    <div className="metrics-grid">
      {items.map((item) => (
        <Card key={item.name} className="metric-card">
          <CardHeader>
            <CardDescription>{item.name}</CardDescription>
            <CardTitle className={`metric-value ${item.tone}`}>
              {item.value}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{item.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export function RunFacts() {
  const { run } = useDemo();
  return (
    <div className="run-facts">
      <Badge variant="outline">{run.symbol}</Badge>
      <Badge variant="outline">{run.interval}</Badge>
      <Badge variant="outline">2024 · Invented dates</Badge>
      <span>Starting sample equity {money(run.initialCapital)}</span>
    </div>
  );
}
export function ExploreLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      {children}
      <ArrowUpRight data-icon="inline-end" />
    </Link>
  );
}
