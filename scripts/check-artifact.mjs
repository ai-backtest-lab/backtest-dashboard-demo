import fs from "node:fs";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
for (const route of ["/", "/analysis/", "/claude/"]) {
  const doc = new JSDOM(
    fs.readFileSync(
      route === "/" ? "out/index.html" : `out${route}index.html`,
      "utf8",
    ),
  ).window.document;
  assert.equal(doc.querySelectorAll("h1").length, 1);
  assert.equal(
    doc.querySelector("link[rel=canonical]").href,
    "https://demo.aibacktestlab.com" + route,
  );
  assert.ok(
    doc.querySelector('meta[name="robots"]').content.includes("noindex"),
  );
  assert.ok(
    doc
      .querySelector("main")
      .textContent.includes("Synthetic demonstration data"),
  );
  assert.ok(doc.querySelector("main").textContent.includes("2024"));
  if (route === "/claude/") {
    assert.ok(
      doc.querySelector("main").textContent.includes("Planned integration"),
    );
    assert.ok(
      doc.querySelector("main").textContent.includes("not live AI responses"),
    );
  }
  console.log(`PASS static HTML ${route}`);
}
assert.ok(fs.existsSync("out/404.html"));
assert.ok(fs.existsSync("out/robots.txt"));
// No sitemap: every page is noindex, so submitting one only produces
// "Submitted URL marked noindex" warnings in Search Console.
assert.ok(!fs.existsSync("out/sitemap.xml"));
assert.ok(!fs.existsSync("out/api"));
console.log(
  "PASS: default content crawlable without JS; synthetic demo intentionally noindex, no API routes.",
);
