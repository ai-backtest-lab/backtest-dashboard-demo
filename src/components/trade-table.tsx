"use client";
import { useState } from "react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "./shared";
import { date, money, pct, type Run, type Trade } from "@/lib/data";
import { filterTrades, type TradeFilter, type TradeSort } from "@/lib/metrics";
export function TradeTable({
  run,
  selectedTrade,
  onSelect,
}: {
  run: Run;
  selectedTrade: Trade | null;
  onSelect: (t: Trade) => void;
}) {
  const [filter, setFilter] = useState<TradeFilter>("all"),
    [sort, setSort] = useState<TradeSort>("date");
  const rows = filterTrades(run.trades, filter, sort);
  return (
    <Panel
      title="Trade log"
      description="Inspect an example to focus the chart and reconcile its costs."
      action={
        <Badge variant="outline">
          {rows.length} of {run.trades.length} trades
        </Badge>
      }
    >
      <div className="table-toolbar">
        <div>
          <label htmlFor="trade-filter">Result</label>
          <NativeSelect
            id="trade-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as TradeFilter)}
          >
            <NativeSelectOption value="all">All trades</NativeSelectOption>
            <NativeSelectOption value="win">Winning trades</NativeSelectOption>
            <NativeSelectOption value="loss">Losing trades</NativeSelectOption>
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="trade-sort">Sort by</label>
          <NativeSelect
            id="trade-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as TradeSort)}
          >
            <NativeSelectOption value="date">Entry date</NativeSelectOption>
            <NativeSelectOption value="pnl">
              Net PnL (highest first)
            </NativeSelectOption>
          </NativeSelect>
        </div>
      </div>
      <Table>
        <TableCaption>
          Synthetic trades only. Net PnL = gross PnL − fees − slippage.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Trade</TableHead>
            <TableHead>Entry → Exit</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Entry price</TableHead>
            <TableHead>Exit price</TableHead>
            <TableHead>Costs</TableHead>
            <TableHead>Net PnL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow
              key={t.id}
              data-state={selectedTrade?.id === t.id ? "selected" : undefined}
            >
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelect(t)}
                  aria-label={`Inspect trade ${run.trades.indexOf(t) + 1}`}
                  aria-pressed={selectedTrade?.id === t.id}
                >
                  #{String(run.trades.indexOf(t) + 1).padStart(2, "0")}
                </Button>
              </TableCell>
              <TableCell className="mono">
                {date(t.entryTime)} → {date(t.exitTime)}
              </TableCell>
              <TableCell>{t.side}</TableCell>
              <TableCell className="mono">{money(t.entryPrice)}</TableCell>
              <TableCell className="mono">{money(t.exitPrice)}</TableCell>
              <TableCell className="mono">
                {money(t.fees + t.slippage)}
              </TableCell>
              <TableCell
                className={`mono ${t.netPnl >= 0 ? "positive" : "negative"}`}
              >
                {money(t.netPnl, true)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!rows.length && (
        <p role="status" className="data-note">
          No sample trades match this filter. Choose All trades.
        </p>
      )}
      {selectedTrade && (
        <div
          className="trade-detail"
          role="region"
          aria-label="Selected trade details"
          aria-live="polite"
        >
          <strong>
            Trade #{run.trades.indexOf(selectedTrade) + 1} ·{" "}
            {selectedTrade.exitReason}
          </strong>
          <dl>
            <div>
              <dt>Quantity</dt>
              <dd>{selectedTrade.quantity.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Gross PnL</dt>
              <dd>{money(selectedTrade.grossPnl, true)}</dd>
            </div>
            <div>
              <dt>Fees</dt>
              <dd>{money(selectedTrade.fees)}</dd>
            </div>
            <div>
              <dt>Slippage</dt>
              <dd>{money(selectedTrade.slippage)}</dd>
            </div>
            <div>
              <dt>Net trade return</dt>
              <dd>{pct(selectedTrade.returnPct, true)}</dd>
            </div>
          </dl>
        </div>
      )}
    </Panel>
  );
}
