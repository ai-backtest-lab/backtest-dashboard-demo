import snapshot from "@/data/demo.json";
export const demo = snapshot;
export const runs = snapshot.runs;
export type Run = (typeof runs)[number];
export type Trade = Run["trades"][number];
export const defaultRun = runs[0];
export const getRun = (id: string | null | undefined) =>
  runs.find((run) => run.id === id) ?? defaultRun;
export const money = (value: number, signed = false) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(value);
export const pct = (value: number, signed = false) =>
  `${signed && value > 0 ? "+" : ""}${value.toFixed(2)}%`;
export const date = (time: number) =>
  new Date(time * 1000).toISOString().slice(0, 10);
