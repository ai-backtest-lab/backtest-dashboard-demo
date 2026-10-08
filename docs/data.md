---
status: current
last_verified: 2026-10-08
code: src/data/demo.json, scripts/generate-data.mjs, scripts/check-data.mjs, src/lib/metrics.ts
---

# Dữ liệu public và phép tính

Không có snapshot private được operator duyệt trong đầu vào/repo mới. Chọn fallback synthetic theo brief; không truy vấn database, không export kết quả/copy proprietary strategy hoặc tham số. Không dùng raw/action/calendar evidence của VN. Các tên Trend/Range/Lower-exposure chỉ là case minh họa, không phải tên strategy private.

Generator chỉ dùng hàm deterministic tự viết, không có market provider hoặc seed lấy từ private service. Ba samples, mỗi sample300 daily OHLCV và18 sample trades; dates2024 hư cấu. JSON version1 có provenance, assumptions, candles/trades/equity. Không API/venue/user/credential/private source.

- Trades là lịch sample định sẵn; không có engine/signal generation. Mỗi lệnh Long, không leverage; entry/exit reference bằng close candle tương ứng. Quantity theo sample equity đã realized × exposure / entry reference.
- Gross PnL = quantity × (exit reference − entry reference).
- Entry fill = reference × (1 + slippage); exit fill = reference × (1 − slippage). Fees dựa trên fill notional hai phía; slippage hiển thị riêng để reconcile net = gross − fees − slippage.
- Equity mỗi ngày = capital ban đầu + realized net + open mark-to-market sau estimated liquidation costs. Khi không có position, equity giữ nguyên; cuối sample không còn lệnh mở.
- Return = (equity / capital − 1) ×100. Drawdown = (equity / running peak −1) ×100, có capital ban đầu làm peak.
- Win rate/profit factor/expectancy dùng net trade outcomes. Không dựng Sharpe khi chưa định nghĩa rõ annualization; không annualize synthetic returns để tạo claim performance.
- SMA200 lấy mean của200 daily closes;199 candles đầu không có SMA200, first point ởindex199. Volume synthetic.

Validator độc lập kiểm OHLC/time order/trade source/costs/quantity/daily equity/drawdown; unit tests kiểm reconciliation, edge case losing-only và filtering/SMA. UI format2 decimals nhưng JSON giữ precision cho đối soát. Displayed daily drawdown không đại diện intraday worst-case.

Nếu thay bằng recorded snapshot sau này: cần public approval cụ thể, provenance, redaction và source-value reconciliation; nhãn từng sample phải đúng data_kind. Không đổi provenance thành recorded chỉ vì data có dạng giống backtest. Claude report luôn illustrative cho tới khi có integration thực được kiểm.
