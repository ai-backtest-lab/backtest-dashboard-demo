---
status: current
last_verified: 2026-10-08
code: src/, scripts/, next.config.ts, wrangler.jsonc, docs/browser-evidence.json
---

# Review và kiểm chứng bản đầu

## Các kiểm tra đã thực sự chạy

- `pnpm install --frozen-lockfile`: qua; lockfile/packageManager và native allowlist nhất quán.
- `pnpm test`: 8 tests/2 files qua. Accounting/final equity/drawdown, losing-only profit factor, immutable filter/sort, SMA200; UI sample selector/trade inspection/Claude labels/questions/checklist.
- `pnpm type-check`, `pnpm lint`: qua; không warnings/errors.
- `pnpm data:check`: cả3 samples/300dailybars/18trades mỗi sample đối soát OHLC/time/source/costs/exposure/daily equity/drawdown/final cash.
- `pnpm build`, `pnpm artifact:check`: qua. out/ có ba screens cùng404/robots/sitemap/favicon/notices, content mặc định có trong HTML, một H1/page, canonical đúng domain, synthetic demo noindex. Không runtime/API route.
- `pnpm public:check`: scan source/config/data/docs không thấy credential patterns hoặc runtime service calls; review thủ công xác nhận chỉ synthetic data và code demo tự viết/shadcn registry.
- `pnpm deploy:dry-run`: qua. Wrangler4.148.0 đọc assets từout/, không bindings hoặc upload. `wrangler preview --help` có command open beta; không thực thi deployment.

## Browser/UX

[Evidence](browser-evidence.json): headed Google Chrome với profile riêng, actual DevTools target, CDP Runtime/Network enabled. Sáu viewport1440/1024/768/390/375/320, cả ba màn hình không horizontal page overflow. Sidebar/mobile Sheet navigation giữ sample, selector đổidata, chart zoom/reset/volume/SMA200, trade filter/sort/focus và đổi sample resetselection, equity unit, Claude tabs, checkbox và clipboard JSON đều qua.

Đã kéo pan bằng mouse, wheel zoom và crosshair readout thật. Keyboard focus/reduced motion qua, default content/no-JS tại mobile qua. `/api/backtest/`, private-looking path vàunknown URL trả404. Không console/page errors, external hoặc API requests từ app.

Axe WCAG2A/AA/2.1AA chạy trên Overview desktop, Analysis desktop, Claude1440 và320: zero violations. Đây là automated coverage của các states đã kiểm, không chứng nhận accessibility toàn bộ mọi trình duyệt. Review visual screenshots desktop/mobile xác nhận dark/research-green, sentence case, table scroll cục bộ và attribution readable.

## Findings đã xử lý

- Float equality trong drawdown test: dùng numeric tolerance, không thay phép tính để ép equality.
- Formatter TypeScript có implicit-any: khai báo number; test query dùng role checkbox để tránh duplicate hidden native input của Base UI, bỏ option không thuộc Testing Library contract.
- DevTools chưa khởi tạo xong: harness poll bounded actual target, không bỏ gate.
- Chart `role=img` chứa attribution link gây nested-interactive: đổi thành labeled region.
- Evidence JSON scroll region chưa keyboard-focusable: thêm tabIndex/label. Clipboard assertion đợi async status, giữ test copy payload thật.

## Public review và phần operator làm

Không export private run, screenshot/PnL, strategy source/parameters, secret, account/customer data hoặc infrastructure config. Hai reference repos chỉ đọc; duy nhất brand favicon/theme được reuse từ landing theo brief. Chart giữ TradingView attribution/Apache2; shadcn MIT, Geist/Geist Mono OFL và dependencies có notices. Không copy React Bits/GSAP.

README gốc và git history được giữ. Source/demo sẵn sàng push default branch; deploy/domain/token/DNS do operator thực hiện theo [guide](deployment.md). Không deploy hoặc submit hồ sơ; Claude integration/actual quantitative execution/out-of-sample vẫn không tồn tại trong demo.

Local static preview3231 đang chạy bằng helper foreground được agent mở cho operator xem. Không backend được đưa lên Cloudflare; helper Python chỉ local. Screenshots/profile không commit; browser profile đã cleanup. Dữ liệu synthetic không chứng minh performance của private Backtest Service.
