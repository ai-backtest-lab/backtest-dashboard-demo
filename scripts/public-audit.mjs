import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const skip = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "tmp",
  ".runtime",
  ".wrangler",
]);
let checked = 0;
function walk(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) {
      if (!skip.has(item.name)) walk(file);
      continue;
    }
    assert.ok(
      !/^\.env|^\.dev\.vars|\.pem$/.test(item.name),
      `Private configuration must not be published: ${file}`,
    );
    if (!/\.(tsx?|mjs|json|css|md|txt|yaml|py)$/.test(item.name)) continue;
    const text = fs.readFileSync(file, "utf8");
    assert.ok(
      !/(sk-ant-[A-Za-z0-9_-]{15,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)/.test(
        text,
      ),
      `Potential credential in ${file}`,
    );
    if (file.startsWith("src") && !file.includes(".test."))
      assert.ok(
        !/\bfetch\s*\(|\baxios\b|WebSocket|process\.env/.test(text),
        `Unexpected runtime service dependency: ${file}`,
      );
    checked++;
  }
}
walk(".");
assert.equal(
  JSON.parse(fs.readFileSync("src/data/demo.json", "utf8")).provenance.kind,
  "synthetic",
);
console.log(
  `PASS public-source audit: ${checked} text files, no detected credentials or runtime API dependencies. Human review still owns provenance and licensing.`,
);
