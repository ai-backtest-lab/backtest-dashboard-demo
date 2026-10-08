---
status: current
last_verified: 2026-10-08
code: package.json, pnpm-lock.yaml, next.config.ts, wrangler.jsonc
---

# Cloudflare Dashboard — triển khai thủ công

| Setting | Giá trị |
|---|---|
| Repository | `ai-backtest-lab/backtest-dashboard-demo` |
| Project/Worker name | `backtest-dashboard-demo` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | `pnpm run build` |
| Deploy command | `pnpm exec wrangler deploy` |
| Preview command | `pnpm exec wrangler preview` |
| Preview builds | Disabled |
| Cloudflare Access | Disabled |
| Environment variables | None |
| API token | Cloudflare tự tạo/quản lý; không commit hoặc paste vào source |
| Custom domain | `demo.aibacktestlab.com` |

Wrangler local4.148.0; `preview --help` có command(open beta). Preview builds Disabled; agent không chạy preview deployment. Assets config: `directory: ./out`, `html_handling: auto-trailing-slash`, `not_found_handling: 404-page`, không `main` hoặc bindings. Static export không dùng OpenNext hoặc runtime server.

1. Kết nối GitHub repo với Workers Builds và nhập settings trên. Package manager được khóa bằng `packageManager: pnpm@12.6.0`; build dùng Node22+. Không cần environment configuration cho public app.
2. Khi muốn public, operator click Deploy. Agent chỉ kiểm dry-run local.
3. Worker → Settings → Domains & Routes → Add Custom Domain → `demo.aibacktestlab.com`; kiểm DNS/HTTPS trong zone của operator. Không sửa landing/apex domain.
4. Kiểm `/`, `/analysis/`, `/claude/`, favicon và notices; unknown URL trả404. Kiểm mobile, labels synthetic/Planned, chart assets và link về landing.

Cấu hình assets-only không sử dụng paid bindings/service. Dry-run không xác minh GitHub permissions, token/account, DNS/custom domain hoặc quota thực tế; các bước đó chỉ operator làm trong Dashboard. Không hứa không có giới hạn traffic của Free plan.

Tham chiếu: [Cloudflare Static Assets](https://developers.cloudflare.com/workers/static-assets/get-started/), [Next.js Static Export](https://nextjs.org/docs/app/guides/static-exports), installed Wrangler schema/help. Không có CI/CD hoặc automatic deploy trong repo.
