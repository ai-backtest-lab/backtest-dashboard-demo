"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  LayoutDashboard,
  ChartCandlestick,
  Sparkles,
  Menu,
  ShieldCheck,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
const navigation = [
  { href: "/", name: "Research overview", icon: LayoutDashboard },
  { href: "/analysis/", name: "Backtest analysis", icon: ChartCandlestick },
  { href: "/claude/", name: "Claude preview", icon: Sparkles },
];
function Brand() {
  return (
    <Link href="/" className="brand" aria-label="AI Backtest Lab demo home">
      <span className="brand-symbol">
        ai<span>↗</span>
      </span>
      <span>
        Backtest Lab<small>Research workspace</small>
      </span>
    </Link>
  );
}
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = (
    <nav aria-label="Dashboard navigation">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          aria-current={
            pathname.replace(/\/$/, "") === item.href.replace(/\/$/, "")
              ? "page"
              : undefined
          }
          className={cn(
            "nav-link",
            pathname.replace(/\/$/, "") === item.href.replace(/\/$/, "") &&
              "nav-active",
          )}
        >
          <item.icon aria-hidden="true" />
          {item.name}
          {item.href === "/claude/" && (
            <span className="nav-hint">Planned</span>
          )}
        </Link>
      ))}
    </nav>
  );
  return (
    <div className="workspace">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <div className="sidebar-section-label">Workspace</div>
        {nav}
        <div className="sidebar-bottom">
          <ShieldCheck aria-hidden="true" />
          <p>
            Evidence before explanations.
            <small>
              This public demo uses invented data. No orders are executed.
            </small>
          </p>
          <a href="https://aibacktestlab.com">
            About AI Backtest Lab <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="topbar">
          <div className="mobile-menu">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open navigation"
                  />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>AI Backtest Lab</SheetTitle>
                </SheetHeader>
                {nav}
              </SheetContent>
            </Sheet>
          </div>
          <div className="topbar-caption">
            <span className="status-dot" />
            Public interactive demo
          </div>
          <div className="topbar-actions">
            <Badge variant="secondary">Demo mode</Badge>
            <a
              href="https://aibacktestlab.com"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Visit website <ArrowUpRight data-icon="inline-end" />
            </a>
          </div>
        </header>
        <main id="main" className="content">
          {children}
          <noscript>
            <p className="data-note">
              JavaScript enables charts, selectors and filters. The default
              sample summary remains readable below; no backend is required.
            </p>
          </noscript>
        </main>
        <footer className="workspace-footer">
          <span>AI Backtest Lab · Synthetic demonstration data</span>
          <span>
            Research illustration, not financial advice.{" "}
            <a href="/third-party-notices.txt">Component notices</a>
          </span>
        </footer>
      </div>
    </div>
  );
}
