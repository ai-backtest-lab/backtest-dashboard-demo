import { chromium } from "playwright-core";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3231";
const result = {
  started: new Date().toISOString(),
  headed: true,
  scenarios: [],
  consoleErrors: [],
  pageErrors: [],
  externalRequests: [],
  apiRequests: [],
  accessibility: [],
  devtools: false,
};
fs.mkdirSync("tmp", { recursive: true });
const profile = fs.mkdtempSync("tmp/chrome-demo-");
let context;
const deadline = setTimeout(() => {
  result.deadline = true;
  void context?.close();
}, 180000);
function track(page) {
  page.on("pageerror", (e) => result.pageErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") result.consoleErrors.push(m.text());
  });
  page.on("request", (r) => {
    if (!r.url().startsWith(base) && !r.url().startsWith("data:"))
      result.externalRequests.push(r.url());
    if (new URL(r.url()).pathname.startsWith("/api/"))
      result.apiRequests.push(r.url());
  });
}
async function noOverflow(page) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    "Viewport must not overflow",
  );
}
async function axe(page, label) {
  const report = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  result.accessibility.push({
    label,
    violations: report.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
  assert.equal(
    report.violations.length,
    0,
    JSON.stringify(result.accessibility.at(-1)),
  );
}
async function waitCharts(page) {
  await page.locator("canvas").first().waitFor();
  await page.waitForTimeout(400);
}
try {
  context = await chromium.launchPersistentContext(profile, {
    executablePath: "/usr/bin/google-chrome",
    headless: false,
    viewport: { width: 1440, height: 1000 },
    args: [
      "--no-sandbox",
      "--auto-open-devtools-for-tabs",
      "--remote-debugging-port=9225",
    ],
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  track(page);
  await page.goto(base);
  await waitCharts(page);
  await page.getByRole("heading", { level: 1 }).waitFor();
  let devtools;
  for (let attempt = 0; attempt < 30; attempt++) {
    const targets = await (
      await fetch("http://127.0.0.1:9225/json/list")
    ).json();
    result.devtoolsTargets = targets.map((t) => ({
      title: t.title,
      url: t.url,
      type: t.type,
    }));
    devtools = targets.find(
      (t) => t.url.startsWith("devtools://") && t.title.includes("3231"),
    );
    if (devtools) break;
    await page.waitForTimeout(300);
  }
  assert.ok(devtools, "Actual Chrome DevTools target required");
  result.devtools = { title: devtools.title, url: devtools.url };
  const cdp = await context.newCDPSession(page);
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");
  for (const width of [1440, 1024, 768, 390, 375, 320]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(base);
    await waitCharts(page);
    await noOverflow(page);
    await page.screenshot({
      path: `tmp/overview-${width}.png`,
      fullPage: true,
    });
    await page.getByLabel("Strategy sample").selectOption("range");
    assert.equal(
      await page
        .locator(".run-facts")
        .getByText("ETH / USD", { exact: true })
        .count(),
      1,
    );
    if (width < 1024) {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await page
        .getByRole("dialog")
        .getByRole("link", { name: "Backtest analysis", exact: true })
        .click();
    } else
      await page
        .getByRole("navigation", { name: "Dashboard navigation" })
        .getByRole("link", { name: "Backtest analysis", exact: true })
        .click();
    await page.waitForURL("**/analysis/");
    await waitCharts(page);
    assert.equal(
      await page.getByLabel("Strategy sample").inputValue(),
      "range",
    );
    await noOverflow(page);
    const before = await page.getByTestId("chart-range").innerText();
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForTimeout(250);
    assert.notEqual(await page.getByTestId("chart-range").innerText(), before);
    await page.getByRole("button", { name: "Zoom out", exact: true }).click();
    await page.getByRole("button", { name: "Reset view", exact: true }).click();
    await page.waitForTimeout(250);
    assert.equal(await page.getByTestId("chart-range").innerText(), before);
    if (width === 1440) {
      const box = await page.locator(".price-host").boundingBox();
      const readout = await page.locator(".ohlc-readout").innerText();
      await page.mouse.move(box.x + box.width * 0.5, box.y + 100);
      await page.waitForTimeout(150);
      assert.notEqual(await page.locator(".ohlc-readout").innerText(), readout);
      const panBefore = await page.getByTestId("chart-range").innerText();
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.7, box.y + 100, {
        steps: 12,
      });
      await page.mouse.up();
      await page.waitForTimeout(200);
      assert.notEqual(
        await page.getByTestId("chart-range").innerText(),
        panBefore,
      );
      const wheelBefore = await page.getByTestId("chart-range").innerText();
      await page.mouse.wheel(0, -400);
      await page.waitForTimeout(250);
      assert.notEqual(
        await page.getByTestId("chart-range").innerText(),
        wheelBefore,
      );
      await page
        .getByRole("button", { name: "Reset view", exact: true })
        .click();
      result.pointerExploration = {
        pan: true,
        wheelZoom: true,
        crosshairReadout: true,
      };
    }
    await page.getByRole("button", { name: "SMA200", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "SMA200", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.getByRole("button", { name: "Volume", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "Volume", exact: true })
        .getAttribute("aria-pressed"),
      "false",
    );
    await page.getByLabel("Result", { exact: true }).selectOption("loss");
    assert.ok(
      (await page.getByRole("button", { name: /Inspect trade/ }).count()) > 0,
    );
    await page.getByLabel("Sort by").selectOption("pnl");
    await page
      .getByRole("button", { name: /Inspect trade/ })
      .first()
      .click();
    assert.ok(
      await page
        .getByRole("region", { name: "Selected trade details" })
        .isVisible(),
    );
    await page.getByLabel("Result", { exact: true }).selectOption("all");
    await page.getByLabel("Strategy sample").selectOption("defensive");
    assert.equal(
      await page
        .getByRole("region", { name: "Selected trade details" })
        .count(),
      0,
    );
    await page.getByRole("button", { name: "PnL $", exact: true }).click();
    assert.equal(
      await page
        .getByRole("button", { name: "PnL $", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.screenshot({
      path: `tmp/analysis-${width}.png`,
      fullPage: true,
    });
    if (width === 1440) await axe(page, "analysis desktop");
    await page
      .getByRole("link", { name: "Explore planned Claude analysis" })
      .click();
    await page.waitForURL("**/claude/");
    await page.waitForTimeout(250);
    await noOverflow(page);
    assert.equal(
      await page.getByLabel("Strategy sample").inputValue(),
      "defensive",
    );
    await page.getByRole("tab", { name: "Costs", exact: true }).click();
    assert.ok(
      await page
        .getByRole("heading", { name: "How much do costs change the result?" })
        .isVisible(),
    );
    await page.getByRole("tab", { name: "Next test", exact: true }).click();
    assert.ok(
      await page
        .getByRole("heading", {
          name: "Which hypothesis should we validate next?",
        })
        .isVisible(),
    );
    await page
      .getByRole("checkbox", { name: "Define an untouched evaluation window" })
      .check();
    assert.ok(await page.getByText("1/3 noted").isVisible());
    await page
      .getByText("Inspect planned input format", { exact: true })
      .click();
    await page.bringToFront();
    await page
      .getByRole("button", { name: "Copy evidence JSON", exact: true })
      .click();
    try {
      await page
        .getByText("Evidence JSON copied.", { exact: true })
        .waitFor({ state: "visible", timeout: 5000 });
    } catch (error) {
      result.clipboardStatus = await page.locator(".evidence-json").innerText();
      throw error;
    }
    assert.equal(
      JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))
        .data_kind,
      "synthetic",
    );
    await page.screenshot({ path: `tmp/claude-${width}.png`, fullPage: true });
    if (width === 320 || width === 1440) await axe(page, `claude ${width}`);
    result.scenarios.push({
      width,
      status: "PASS",
      navigation: true,
      selector: true,
      zoomReset: true,
      indicators: true,
      tradeFilterSortFocus: true,
      questionTabs: true,
      checklist: true,
      copy: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await waitCharts(page);
  await axe(page, "overview desktop");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  assert.ok(
    await page.evaluate(() => document.activeElement?.tagName !== "BODY"),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByLabel("Strategy sample").selectOption("range");
  await waitCharts(page);
  assert.equal(
    await page.evaluate(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    true,
  );
  result.scenarios.push({
    reducedMotion: true,
    keyboardFocus: true,
    status: "PASS",
  });
  const noJs = await context.browser().newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const raw = await noJs.newPage();
  await raw.goto(base + "/claude/");
  assert.ok(await raw.getByRole("heading", { level: 1 }).isVisible());
  assert.ok(
    await raw.getByText("Claude API · Planned integration").isVisible(),
  );
  await noOverflow(raw);
  await noJs.close();
  result.scenarios.push({ javaScriptDisabled: true, status: "PASS" });
  for (const path of ["/api/backtest/", "/dashboard/private/", "/missing/"]) {
    const response = await context.request.get(base + path);
    assert.equal(response.status(), 404);
  }
  result.boundary404 = true;
  assert.deepEqual(result.consoleErrors, []);
  assert.deepEqual(result.pageErrors, []);
  assert.deepEqual(result.externalRequests, []);
  assert.deepEqual(result.apiRequests, []);
  result.finished = new Date().toISOString();
  console.log(
    "PASS: headed Chrome/DevTools, 6 widths, all demo interactions, axe, keyboard/reduced motion/no-JS, no backend/external requests.",
  );
} catch (e) {
  result.failure = String(e);
  console.error(e);
  process.exitCode = 1;
} finally {
  clearTimeout(deadline);
  fs.writeFileSync(
    "tmp/browser-results.json",
    JSON.stringify(result, null, 2) + "\n",
  );
  await context?.close();
  fs.rmSync(profile, { recursive: true, force: true });
}
