# Paper Links And Project Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add verified ACL paper abstracts and official links, align homepage and CV link priorities, and switch `Distill Yourself` project-facing links to its project homepage.

**Architecture:** Keep `data/publications.json` as the publication truth source and only adjust homepage rendering if the current title-link/button-link behavior cannot express the new policy. Update `projects/index.html` and the CV TeX sources so the same venue-first policy is reflected everywhere without expanding project scope.

**Tech Stack:** Static HTML, JSON, vanilla JavaScript, LaTeX/XeLaTeX, Git

## Global Constraints

- Add concise homepage abstracts only for the two ACL 2026 collaboration papers.
- Prefer official conference URLs for paper title links when available.
- Keep `arXiv` buttons pointed at arXiv when available; otherwise allow venue fallback.
- AAAI papers keep arXiv as the effective primary link target.
- Prefer `https://quantaalpha.com/Distill-Yourself/` for project-facing `Distill Yourself` links.
- Do not add project cards for papers that do not have independent project homepages.
- Do not redesign the homepage publication UI.
- Do not invent links or summaries without verified source grounding.

---

### Task 1: Update Homepage Publication Metadata

**Files:**
- Modify: `data/publications.json`
- Inspect: `index.html`

**Interfaces:**
- Consumes: existing publication records in `data/publications.json`
- Produces: updated publication records with `abstract`, `links.paper`, and `links.arxiv` values consumable by homepage rendering

- [ ] **Step 1: Inspect the target publication records**

Run: `grep -n "\"id\": \"\\(tool-calling-eki\\|harmonizing-nsc\\)\"" -A 40 data/publications.json`

Expected: two publication blocks with current link fields visible.

- [ ] **Step 2: Add verified venue links and concise abstracts**

Update the two publication blocks to follow this shape:

```json
"links": {
  "paper": "https://aclanthology.org/2026.acl-long.1244/",
  "arxiv": "https://arxiv.org/abs/2606.10875"
},
"abstract": "..."
```

and:

```json
"links": {
  "paper": "https://aclanthology.org/2026.findings-acl.710/",
  "arxiv": "https://aclanthology.org/2026.findings-acl.710/"
},
"abstract": "..."
```

The abstract text must stay descriptive, short, and consistent with nearby entries.

- [ ] **Step 3: Inspect publication rendering logic**

Run: `grep -n "links\\." -n index.html | head -n 20`

Expected: the publication card renderer shows how title links and arXiv buttons are selected.

- [ ] **Step 4: Apply the minimal rendering fix if needed**

If the current renderer does not already prefer `links.paper` for the title and `links.arxiv` for the arXiv button, update it toward this logic:

```javascript
const paperUrl = pub.links?.paper || pub.links?.arxiv || '';
const arxivUrl = pub.links?.arxiv || pub.links?.paper || '';
```

and use `paperUrl` for the title anchor plus `arxivUrl` for the arXiv button.

- [ ] **Step 5: Validate JSON and homepage behavior**

Run: `python3 -m json.tool data/publications.json >/dev/null`

Expected: command exits `0`.

- [ ] **Step 6: Commit**

```bash
git add data/publications.json index.html
git commit -m "feat: update publication metadata links"
```

### Task 2: Update Project-Facing Distill Yourself Links

**Files:**
- Modify: `projects/index.html`
- Inspect: `index.html`
- Inspect: `README.md`

**Interfaces:**
- Consumes: current Distill Yourself homepage URL and existing project/news/card markup
- Produces: consistent project-facing links that prefer the project homepage

- [ ] **Step 1: Locate Distill Yourself references**

Run: `grep -Rni "Distill Yourself" index.html projects/index.html README.md`

Expected: all user-facing references in the main homepage, project hub, and README are listed.

- [ ] **Step 2: Update project-facing URLs**

Prefer this URL in project-facing contexts:

```text
https://quantaalpha.com/Distill-Yourself/
```

Keep GitHub only where the surrounding text explicitly means repository or code.

- [ ] **Step 3: Keep project hub scope narrow**

Do not add ACL paper cards into `projects/index.html`. Only adjust the existing Distill Yourself card copy and link target if needed.

- [ ] **Step 4: Smoke-check rendered entry points**

Run a local static server and inspect `/` plus `/projects/` to confirm the updated links appear in the expected places.

- [ ] **Step 5: Commit**

```bash
git add projects/index.html index.html README.md
git commit -m "feat: prefer distill yourself homepage links"
```

### Task 3: Synchronize CV Link Targets

**Files:**
- Modify: `/Users/bytedance/Xn/CASIA/cc/resume/resume.tex`
- Modify: `/Users/bytedance/Xn/CASIA/cc/resume/resume 2/resume-zh_CN.tex`
- Modify: `/Users/bytedance/Xn/CASIA/cc/resume/resume-zh_CN.tex`

**Interfaces:**
- Consumes: venue-first link policy and current CV bullet structure
- Produces: CV source files whose title links match the confirmed policy without altering formatting style

- [ ] **Step 1: Locate the directly affected entries**

Run:

```bash
grep -n "Distill Yourself\\|SHIP\\|SpaRTA\\|Tool-RL-Box\\|ACL 2026\\|AAAI" /Users/bytedance/Xn/CASIA/cc/resume/resume.tex '/Users/bytedance/Xn/CASIA/cc/resume/resume 2/resume-zh_CN.tex' /Users/bytedance/Xn/CASIA/cc/resume/resume-zh_CN.tex
```

Expected: the relevant publication and project lines are shown.

- [ ] **Step 2: Update title links to match policy**

Use conference links for conference papers when available, keep AAAI-linked titles on arXiv, and switch `Distill Yourself` to:

```text
https://quantaalpha.com/Distill-Yourself/
```

Keep the current list wording and parenthetical venue formatting unchanged.

- [ ] **Step 3: Compile the CVs**

Run:

```bash
cd /Users/bytedance/Xn/CASIA/cc/resume && xelatex -interaction=nonstopmode -halt-on-error resume.tex
cd '/Users/bytedance/Xn/CASIA/cc/resume/resume 2' && xelatex -interaction=nonstopmode -halt-on-error resume-zh_CN.tex
```

Expected: both commands exit `0`, allowing known non-fatal `hyperref` warnings only.

- [ ] **Step 4: Commit**

```bash
git add /Users/bytedance/Xn/CASIA/cc/resume/resume.tex '/Users/bytedance/Xn/CASIA/cc/resume/resume 2/resume-zh_CN.tex' /Users/bytedance/Xn/CASIA/cc/resume/resume-zh_CN.tex
git commit -m "feat: align cv publication links"
```

### Task 4: Cross-Check, Review, And Push

**Files:**
- Review: `data/publications.json`
- Review: `index.html`
- Review: `projects/index.html`
- Review: `/Users/bytedance/Xn/CASIA/cc/resume/resume.tex`
- Review: `/Users/bytedance/Xn/CASIA/cc/resume/resume 2/resume-zh_CN.tex`

**Interfaces:**
- Consumes: completed changes from Tasks 1-3
- Produces: verified branch ready for push

- [ ] **Step 1: Run diff hygiene checks**

Run:

```bash
git diff --check
python3 -m json.tool data/publications.json >/dev/null
```

Expected: both commands exit `0`.

- [ ] **Step 2: Review the final diff**

Run: `git diff origin/main...HEAD -- data/publications.json index.html projects/index.html`

Expected: only the intended homepage metadata, link policy, and project link edits are present.

- [ ] **Step 3: Perform targeted code review**

Review for:

```text
- wrong venue/arXiv link pairing
- accidental project-scope expansion in projects/
- CV link regressions or formatting changes
- homepage renderer regressions caused by fallback logic
```

- [ ] **Step 4: Push the branch**

Run: `git push`

Expected: branch updates remote successfully.
