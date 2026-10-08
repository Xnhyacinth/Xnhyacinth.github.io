# Xnhyacinth.github.io

Personal academic homepage for Huanxuan Liao.

Live site: https://xnhyacinth.github.io/

## Structure

- `index.html`: main academic homepage.
- `assets/`: shared images, icons, and CV PDFs.
- `css/` and `js/`: global styling and interaction scripts.
- `data/`: publication and project metadata.
- `projects/`: standalone project homepages and the project hub.
- `sitemap.xml` and `robots.txt`: search engine discovery metadata.

## Publications

Each record in `data/publications.json` has one `researchArea` matching the
Research statement: `long-context`, `knowledge-adaptation`, or `agent-learning`.
Use the work's primary contribution; related topics remain searchable through
its title, abstract keywords, and venue. The existing publication lists retain
their metadata, while the page groups all works by research area and supports
independent publication-type and contribution filters.

Within each area, works are ordered by descending year, then first-authored
works, retaining data order for ties. News and publication venue badges share
the same CSS classes, including `badge-tois` for ACM TOIS.

## Local review before publishing

Run from this repository with Python 3.10 or newer:

```bash
python scripts/preview.py --bind 0.0.0.0 --port 8765
```

Open `http://localhost:8765/` on this machine, or
`http://<reachable-machine-IP>:8765/` from another machine. For networks that
cannot reach the container directly, forward port 8765 through the compute
platform or SSH, then open the forwarded address. The preview serves public
site files, disables caching and directory listings, and excludes `.git` and
local review outputs. Stop a foreground preview with Ctrl+C.

For a temporary public HTTPS preview, run Cloudflare's `cloudflared` in another
terminal while the preview server is running:

```bash
cloudflared tunnel --url http://127.0.0.1:8765 --no-autoupdate --protocol http2
```

Use the temporary `trycloudflare.com` URL printed by the tunnel. The URL remains
usable while both processes are running; stop the tunnel with Ctrl+C.

Review and commit changes locally first. A local commit does not update the
live site. Pushing `main` triggers the GitHub Pages workflow, so push only after
the preview has been approved.
