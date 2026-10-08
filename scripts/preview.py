#!/usr/bin/env python3
"""Serve the static homepage for review without exposing repository internals."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC_PATHS = {
    "index.html", "404.html", "robots.txt", "sitemap.xml",
    "assets", "awards", "css", "data", "js", "pages", "projects", "publications",
}


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        parts = Path(unquote(urlsplit(self.path).path).lstrip("/")).parts
        target = (ROOT / Path(*parts)).resolve()
        if (
            any(part.startswith(".") for part in parts)
            or (parts and parts[0] not in PUBLIC_PATHS)
            or not target.is_relative_to(ROOT)
        ):
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--bind", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    handler = partial(PreviewHandler, directory=str(ROOT))
    with ThreadingHTTPServer((args.bind, args.port), handler) as server:
        print(f"Homepage preview: http://{args.bind}:{args.port}/", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
