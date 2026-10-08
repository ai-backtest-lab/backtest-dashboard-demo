# backtest-dashboard-demo

Ứng dụng demo tương tác public độc lập của **AI Backtest Lab**. Target domain: `https://demo.aibacktestlab.com`. Next.js App Router/TypeScript/Tailwind/shadcn, static export `out/`, không backend/database/authentication/Claude key. README và lịch sử git khởi tạo được giữ nguyên.

## Ba màn hình

- `/`: Research overview — selector sample, metrics, equity/drawdown, chọn research sample.
- `/analysis/`: Candlestick chart zoom/pan/reset, volume/SMA200, trade markers, cost/risk assumptions, trade log filter/sort và focus trade.
- `/claude/`: Planned integration — structured input, illustrative report, research questions và checklist local. Không phải API response, không chạy analysis/backtest/trade.

Visual theo landing AI Backtest Lab: dark neutral/research-green, Geist/Geist Mono, borders nhẹ, shadcn và sentence case. Workflow tham chiếu Backtest Service read-only; không copy frontend/private engine hay strategy source.

## Dữ liệu và giới hạn

**Toàn bộ dữ liệu synthetic.** Ba snapshots ở `src/data/demo.json` được sinh deterministic bằng `scripts/generate-data.mjs`. OHLCV/trades/returns đều hư cấu, kể cả dates2024. Không export private results hoặc dùng market price thật; không phải bằng chứng profitability. Nhãn luôn có trên cả ba màn hình, charts và reports.

Costs/equity/drawdown được đối soát độc lập bằng `pnpm data:check`. Metrics UI tính từ JSON trong browser; không gọi backtest engine. Không có funding/liquidation/out-of-sample hoặc live execution. Chọn sample được giữ qua SPA navigation trong memory; reload/reset sample trở về mặc định. Checklist chỉ tồn tại trong visit, không chứng nhận validation.

Demo mặc định `noindex, follow` để số liệu synthetic không được trình bày như market evidence trong search. Public URL vẫn truy cập được; noindex không phải access control. Nội dung mặc định có trong HTML build-time; interactive charts/selectors cần JavaScript.

## Local development và kiểm tra

Node22+, pnpm12 (packageManager12.6.0). Không environment variables.

```bash
make setup                 # locked dependencies
make dev                   # http://127.0.0.1:3230, foreground
make check                 # tests / TypeScript / lint / data reconciliation
make build                 # export + artifact checks
make preview               # http://127.0.0.1:3231, foreground
```

Dừng foreground dev/preview bằng Ctrl-C trong terminal sở hữu process. Preview dùng Python3 stdlib, chỉ local, không deploy Python/server. Port bận sẽ từ chối, không takeover.

Ở terminal khác sau khi preview chạy:

```bash
make browser-check         # headed Google Chrome / real DevTools, needs DISPLAY
pnpm public:check          # source credential/API-dependency scan
pnpm deploy:dry-run        # Wrangler packaging only, no upload
```

Browser evidence/screenshots ở `tmp/`, profile test độc lập được cleanup; không commit profile. Regenerate dữ liệu khi muốn bằng `pnpm data:generate`, chạy lại `pnpm data:check` và tests trước commit.

## Cloudflare Workers Static Assets

Build: `pnpm run build`. Deploy (operator chạy thủ công): `pnpm exec wrangler deploy`. Chỉ static assets từ `./out`, không Worker script/bindings/Node runtime. Không cần paid services. Static hosting vẫn chịu quota của tài khoản Cloudflare.

[Dashboard settings và các bước gắn domain](docs/deployment.md). Repo không tự deploy hoặc đổi Cloudflare settings. Chỉ kết nối/deploy sau khi operator muốn publish.

## Tài liệu và licenses

[Thiết kế/plan](docs/implementation.md) · [Dữ liệu](docs/data.md) · [Kiểm chứng](docs/verification.md).

Lightweight Charts5.2.0 giữ attribution và Apache2 license/notice tại `public/`. shadcn components được cài từ registry, không lấy source private; MIT license được giữ. Geist/Geist Mono, Lucide và dependencies có notices. [Component notices](public/third-party-notices.txt).
