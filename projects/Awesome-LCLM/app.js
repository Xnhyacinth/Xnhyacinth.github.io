(() => {
  const RAW_BASE =
    "https://raw.githubusercontent.com/Xnhyacinth/Awesome-LLM-Long-Context-Modeling/main/papers/";
  const GH_BASE =
    "https://github.com/Xnhyacinth/Awesome-LLM-Long-Context-Modeling/blob/main/papers/";

  const GROUPS = [
    {
      label: "Attention & systems",
      items: [
        ["01-survey.md", "1. Survey Papers"],
        ["02-efficient-attention.md", "2. Efficient Attention"],
        ["03-kv-cache.md", "3. KV-Cache Optimization"],
        ["04-recurrent-transformers.md", "4. Recurrent Transformers"],
        ["05-state-space-models.md", "5. State Space Models & Hybrids"],
        ["17-inference-acceleration.md", "17. Inference Acceleration & Serving"],
      ],
    },
    {
      label: "Training, position & memory",
      items: [
        ["06-position-encoding.md", "6. Position Encoding & Length Extrapolation"],
        ["07-long-context-training.md", "7. Long-Context Training"],
        ["08-long-term-memory.md", "8. Long-Term Memory"],
        ["09-retrieval-augmented-generation.md", "9. Retrieval-Augmented Generation"],
        ["10-in-context-learning.md", "10. In-Context Learning"],
      ],
    },
    {
      label: "Compression, reasoning & multimodal",
      items: [
        ["11-context-compression.md", "11. Context Compression"],
        ["12-model-compression.md", "12. Model Compression"],
        ["13-long-reasoning.md", "13. Long Reasoning (Long CoT)"],
        ["14-long-video-image.md", "14. Long Video & Image"],
        ["15-long-horizon-agents.md", "15. Long-Horizon Agents"],
        ["16-long-form-text-generation.md", "16. Long-form Text Generation"],
      ],
    },
    {
      label: "Evaluation & reports",
      items: [
        ["18-benchmarks.md", "18. Benchmarks & Evaluation"],
        ["19-technical-reports.md", "19. Technical Reports"],
        ["20-blogs.md", "20. Blogs & Tutorials"],
      ],
    },
  ];

  const flatChapters = GROUPS.flatMap((g) => g.items);
  const cache = new Map();

  const els = {
    nav: document.getElementById("chapterNav"),
    mobile: document.getElementById("mobileChapter"),
    title: document.getElementById("chapterTitle"),
    status: document.getElementById("chapterStatus"),
    list: document.getElementById("paperList"),
    search: document.getElementById("paperSearch"),
    source: document.getElementById("chapterSource"),
  };

  let activeBlocks = [];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isSafeUrl(url) {
    try {
      const u = new URL(url, window.location.href);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }

  function buildNav() {
    const frag = document.createDocumentFragment();
    GROUPS.forEach((group) => {
      const wrap = document.createElement("div");
      wrap.className = "lclm-nav-group";
      const label = document.createElement("div");
      label.className = "lclm-nav-group-label";
      label.textContent = group.label;
      wrap.appendChild(label);
      group.items.forEach(([file, title]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "lclm-nav-btn";
        btn.dataset.file = file;
        btn.textContent = title;
        btn.addEventListener("click", () => selectChapter(file));
        wrap.appendChild(btn);
      });
      frag.appendChild(wrap);
    });
    els.nav.appendChild(frag);

    flatChapters.forEach(([file, title]) => {
      const opt = document.createElement("option");
      opt.value = file;
      opt.textContent = title;
      els.mobile.appendChild(opt);
    });
    els.mobile.addEventListener("change", () => selectChapter(els.mobile.value));
  }

  function setActiveButtons(file) {
    els.nav.querySelectorAll(".lclm-nav-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.file === file);
    });
    els.mobile.value = file;
  }

  function parseMarkdown(md) {
    const lines = md.split(/\r?\n/);
    const blocks = [];
    let currentSub = null;
    let chapterTitle = "";

    // 1. [**Title.**](url) _Authors._ Venue. badges...
    // Title / author trailing periods are optional in older entries.
    const paperRe =
      /^\d+\.\s+\[\*\*(.+?)\.?\*\*\]\(([^)]+)\)\s*(?:_(.+?)_\.?\s*)?(.*)$/;

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (/^#\s+/.test(line) && !chapterTitle) {
        chapterTitle = line.replace(/^#\s+/, "").trim();
        continue;
      }
      if (/^####\s+/.test(line)) {
        currentSub = line.replace(/^####\s+/, "").trim();
        continue;
      }
      if (/^#{1,3}\s+/.test(line)) continue;
      if (/^\[←/.test(line) || !line.trim()) continue;

      const m = line.match(paperRe);
      if (!m) continue;

      const title = m[1].trim();
      const url = m[2].trim();
      const authors = (m[3] || "").trim();
      const rest = (m[4] || "").trim();

      const venue = rest
        .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/\[[^\]]*\]\([^)]+\)/g, "")
        .replace(/\s{2,}/g, " ")
        .replace(/^[\s.]+|[\s.]+$/g, "")
        .trim();

      const badges = [];
      const badgeRe = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
      let bm;
      while ((bm = badgeRe.exec(rest))) {
        if (isSafeUrl(bm[2]) && isSafeUrl(bm[3])) {
          badges.push({ alt: bm[1], img: bm[2], href: bm[3] });
        }
      }

      if (!isSafeUrl(url)) continue;

      blocks.push({
        subsection: currentSub,
        title,
        url,
        authors,
        venue,
        badges,
      });
    }

    return { chapterTitle, papers: blocks };
  }

  function renderPapers(papers, query) {
    const q = (query || "").trim().toLowerCase();
    const filtered = !q
      ? papers
      : papers.filter((p) => {
          const hay = `${p.title} ${p.authors} ${p.venue} ${p.subsection || ""}`.toLowerCase();
          return hay.includes(q);
        });

    els.list.replaceChildren();

    if (!filtered.length) {
      els.status.className = "lclm-status";
      els.status.hidden = false;
      els.status.textContent = q
        ? "No papers match this search in the current chapter."
        : "No papers found in this chapter.";
      return;
    }

    els.status.hidden = true;
    const wrap = document.createElement("div");
    wrap.className = "lclm-paper-list";

    let lastSub = null;
    filtered.forEach((p) => {
      if (p.subsection && p.subsection !== lastSub) {
        const h = document.createElement("h3");
        h.className = "lclm-subhead";
        h.textContent = p.subsection;
        wrap.appendChild(h);
        lastSub = p.subsection;
      }

      const article = document.createElement("article");
      article.className = "lclm-paper";

      const h4 = document.createElement("h4");
      h4.className = "lclm-paper-title";
      const titleA = document.createElement("a");
      titleA.href = p.url;
      titleA.rel = "noopener";
      titleA.textContent = p.title;
      h4.appendChild(titleA);
      article.appendChild(h4);

      const meta = document.createElement("p");
      meta.className = "lclm-paper-meta";
      if (p.authors) {
        const em = document.createElement("em");
        em.textContent = p.authors;
        meta.appendChild(em);
      }
      if (p.authors && p.venue) meta.appendChild(document.createTextNode(" · "));
      if (p.venue) meta.appendChild(document.createTextNode(p.venue));
      article.appendChild(meta);

      const links = document.createElement("div");
      links.className = "lclm-paper-links";
      const paperChip = document.createElement("a");
      paperChip.className = "lclm-chip";
      paperChip.href = p.url;
      paperChip.rel = "noopener";
      paperChip.textContent = "Paper";
      links.appendChild(paperChip);

      p.badges.forEach((b) => {
        const a = document.createElement("a");
        a.className = "lclm-chip";
        a.href = b.href;
        a.rel = "noopener";
        const img = document.createElement("img");
        img.alt = b.alt || "";
        img.src = b.img;
        a.appendChild(img);
        links.appendChild(a);
      });

      article.appendChild(links);
      wrap.appendChild(article);
    });

    els.list.appendChild(wrap);
  }

  async function loadChapter(file) {
    const meta = flatChapters.find((c) => c[0] === file) || [file, file];
    els.title.textContent = meta[1];
    els.source.href = GH_BASE + file;
    els.status.hidden = false;
    els.status.className = "lclm-status";
    els.status.textContent = "Loading chapter…";
    els.list.replaceChildren();

    try {
      let md = cache.get(file);
      if (!md) {
        const res = await fetch(RAW_BASE + file, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        md = await res.text();
        cache.set(file, md);
      }
      const parsed = parseMarkdown(md);
      if (parsed.chapterTitle) els.title.textContent = parsed.chapterTitle;
      activeBlocks = parsed.papers;
      renderPapers(activeBlocks, els.search.value);
    } catch (err) {
      activeBlocks = [];
      els.status.hidden = false;
      els.status.className = "lclm-status is-error";
      els.status.replaceChildren();
      els.status.appendChild(document.createTextNode("Failed to load chapter. "));
      const a = document.createElement("a");
      a.href = GH_BASE + file;
      a.rel = "noopener";
      a.textContent = "Open on GitHub";
      els.status.appendChild(a);
      els.status.appendChild(document.createTextNode(" instead."));
    }
  }

  function selectChapter(file) {
    setActiveButtons(file);
    history.replaceState(null, "", `#${file.replace(/\.md$/, "")}`);
    loadChapter(file);
  }

  function initFromHash() {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash || hash === "papers-reader" || hash === "contribute" || hash === "BibTeX") {
      return flatChapters[0][0];
    }
    const withMd = hash.endsWith(".md") ? hash : `${hash}.md`;
    const hit = flatChapters.find(
      ([f]) => f === withMd || f.replace(/\.md$/, "") === hash
    );
    return hit ? hit[0] : flatChapters[0][0];
  }

  buildNav();
  els.search.addEventListener("input", () => renderPapers(activeBlocks, els.search.value));
  selectChapter(initFromHash());
  window.addEventListener("hashchange", () => {
    const hash = (location.hash || "").replace(/^#/, "");
    if (hash === "papers-reader" || hash === "contribute" || hash === "BibTeX") return;
    selectChapter(initFromHash());
  });
})();
