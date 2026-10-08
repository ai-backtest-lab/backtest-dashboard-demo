---
status: current
last_verified: 2026-10-08
code: src/, scripts/, next.config.ts, wrangler.jsonc
---

# Thiết kế và kế hoạch Dashboard Demo

Phạm vi operator đã giao: clone repo có lịch sử, nghiên cứu reference read-only, làm ba màn hình tĩnh tương tác, kiểm và push default branch; không deploy.

## Nghiên cứu reference

Landing: `docs/design.md`, `globals.css` và shadcn button/badge. Dùng nền neutral-green oklch(0.13 0.009 155), foreground0.94, card0.17, research-green0.8, Geist/Geist Mono, radius0.625rem, border nhẹ; sentence case. Không Plasma/GSAP trên dashboard.

Backtest Service: đọc Research home, strategy detail, EquityCurvePanel, ResearchPriceChart, chart theme và run APIs. Chọn workflow inspect run → metrics/equity/costs → candles/trade log → hypothesis/validation. Không copy engine, strategy source, API client, infrastructure hay private theme. Existing private capabilities là tham chiếu, không chứng nhận kết quả demo.

Chưa có public snapshot đã được duyệt trong input task/repo mới. Dùng synthetic JSON được sinh deterministic trong repo demo, không export dữ liệu private. Giá, lệnh và returns đều hư cấu; mỗi màn hình ghi rõ. Dữ liệu nhất quán nội bộ, có manifest/assumptions và validator; không claim market performance. Không sử dụng AI-generated report như output Claude thật.

## Cấu trúc

- `/`: overview, selector snapshot, metrics, equity, drawdown, strategy cards và link analysis.
- `/analysis/`: selector snapshot, candle chart zoom/pan/reset, volume/SMA200, selectable trade markers, results/risk/assumptions và trade table filter/sort/detail.
- `/claude/`: planned integration, structured evidence preview, illustrative report theo snapshot, ba research questions có câu trả lời viết sẵn và validation checklist local. Không chat/API hoặc nút chạy backtest giả.
- Shared state giữ snapshot qua navigation trong memory/local browser storage; no secrets. Routes có HTML build-time với content mặc định/no-JS message.
- Chart dùng Lightweight Charts5.2, giữ attribution và license notice. Equity/drawdown có textual/table equivalent cho accessibility.
- Static export `out/`; Wrangler assets-only,404 page, không env/secrets/bindings.

## Thứ tự thực hiện

1. Setup Next/TS/Tailwind/shadcn, giữ README gốc và lịch sử git.
2. Synthetic schema/generator/JSON, tests độc lập cho reconciliation/metrics/data validity.
3. Shell/theme và ba màn hình có interactions thực, semantic/accessibility/mobile.
4. Kiểm focused tests → suite/lint/typecheck → build/static artifact/data validation → Chrome DevTools/browser scenarios/axe → Wrangler dry-run.
5. Review public files/licenses/secret patterns, cập nhật docs/evidence, commit nguyên tử và push origin main; không deploy.
