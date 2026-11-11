"""Serve the Wajahni website locally: python3 dev_server.py."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit


class WebsiteHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent), **kwargs)

    def translate_path(self, path):
        parts = urlsplit(path)
        pages = ("home", "index", "educareer", "roadshow", "platform", "wajahni360", "login", "admin")
        routes = {f"/{page}": f"/{page}.html" for page in pages}
        routes.update({"/": "/index.html", "/caravan": "/index.html"})
        if parts.path in routes:
            path = urlunsplit(("", "", routes[parts.path], parts.query, ""))
        return super().translate_path(path)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print("Wajahni is running at http://localhost:3000", flush=True)
    ThreadingHTTPServer(("127.0.0.1", 3000), WebsiteHandler).serve_forever()
