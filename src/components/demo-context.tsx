"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { defaultRun, getRun, type Run } from "@/lib/data";
const Context = createContext<{
  run: Run;
  selectRun: (id: string) => void;
} | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState(defaultRun.id);
  return (
    <Context.Provider value={{ run: getRun(id), selectRun: setId }}>
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider is required");
  return value;
}
