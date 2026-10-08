"""Local-only static preview. No application backend; never deployed."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial
from urllib.parse import urlparse
import socket

ROOT = Path(__file__).resolve().parents[1] / "out"
if not (ROOT / "index.html").exists():
    raise SystemExit("Build out/ first with make build")

class StaticHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if urlparse(self.path).path.endswith("/"):
            target = Path(self.translate_path(self.path))
            if target.is_dir() and not (target / "index.html").exists():
                self.send_error(404)
                return
        super().do_GET()

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (ROOT / "404.html").exists():
            data = (ROOT / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        super().send_error(code, message, explain)

    def log_message(self, format, *args):
        pass

try:
    server = ThreadingHTTPServer(("127.0.0.1", 3231), partial(StaticHandler, directory=str(ROOT)))
except OSError:
    raise SystemExit("Port 3231 is busy; use the existing preview or stop its owner. No takeover.")
print("Static demo preview: http://127.0.0.1:3231", flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
