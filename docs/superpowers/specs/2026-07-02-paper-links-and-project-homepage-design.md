# Paper Links And Project Homepage Design

Date: 2026-07-02
Target repo: `Xnhyacinth.github.io`

## 1. Context

The homepage and CVs already contain publication links, project links, and a project hub page, but the current link strategy is inconsistent:

- some paper titles link to arXiv while venue pages are now available
- some homepage entries have no abstract yet
- `Distill Yourself` is still linked primarily through GitHub in places where a project homepage is now more appropriate
- `projects/` currently mixes true project pages with repository-first links and needs a clearer inclusion rule

The user has now provided explicit link-priority rules and specific ACL URLs for two collaboration papers:

- `https://aclanthology.org/2026.acl-long.1244/`
- `https://aclanthology.org/2026.findings-acl.710/`

The user also wants the new `Distill Yourself` homepage to be preferred:

- `https://quantaalpha.com/Distill-Yourself/`

## 2. Goals

1. Add concise homepage abstracts for the two ACL 2026 collaboration papers.
2. Update homepage paper links to follow one consistent priority policy.
3. Synchronize the same link policy into the English and Chinese CV source files.
4. Update `Distill Yourself` project-facing links to prefer its project homepage.
5. Keep `projects/` restricted to items with independent project homepages.

## 3. Non-goals

1. Do not add project cards for ordinary papers that do not have an independent project homepage.
2. Do not invent links or abstracts without a verified source basis.
3. Do not redesign the publication rendering UI.
4. Do not broaden this task into a full publication metadata rewrite for every paper in the repository.

## 4. Confirmed policy

### 4.1 Publication link priority

For homepage publication entries:

- title link: prefer the conference or official venue page
- `arXiv` button: prefer the arXiv URL
- if a paper has no arXiv URL, the `arXiv` button may fall back to the conference page
- AAAI papers continue to use arXiv as the effective primary link target

For CV entries:

- paper title links should prefer the conference page when available
- if the paper is AAAI, keep the title linked to arXiv
- do not add extra secondary links into the CV body unless they already exist as part of the current format

### 4.2 Distill Yourself link role split

- project-facing links should prefer `https://quantaalpha.com/Distill-Yourself/`
- repository-facing links may continue to use GitHub when the context is explicitly code or repository oriented

### 4.3 Project hub inclusion rule

`projects/` should contain only entries with independent project homepages.

Under this rule:

- `Distill Yourself` remains in `projects/`, but its card should point to the new project homepage
- the two ACL papers should not be added as project cards if they only have conference pages

## 5. Scope of edits

### 5.1 Homepage data

Modify `data/publications.json` to:

- add abstracts for:
  - `Pushing the Limits of LLM Tool Calling via Experiential Knowledge Integration and Activation`
  - `Harmonizing the Past, Present, and Future: A Null-Space Constrained Region-Specific Method for Continual Learning in LLMs`
- add or update official venue links for the corresponding records
- preserve arXiv links where they exist
- leave unrelated publication records unchanged unless needed to satisfy the confirmed link policy in directly affected entries

### 5.2 Homepage rendering logic

Inspect the publication rendering logic in `index.html` and update it only if needed so that:

- title links prefer the venue page
- `arXiv` buttons still point to arXiv when available
- fallback to venue pages works for entries without arXiv

The implementation should stay minimal and should not restructure the publication UI.

### 5.3 Project hub

Modify `projects/index.html` so that:

- the `Distill Yourself` card points to `https://quantaalpha.com/Distill-Yourself/`
- the text framing matches its role as a project homepage rather than only a repository
- no extra project cards are added for papers without independent project homepages

### 5.4 CV synchronization

Modify:

- `resume/resume.tex`
- `resume/resume 2/resume-zh_CN.tex`

and, if needed for consistency with current local duplication,

- `resume/resume-zh_CN.tex`

The synchronization should cover:

- `Distill Yourself`
- the ACL-related entries affected by the new official links
- existing entries such as `SHIP`, `SpaRTA`, and `Tool-RL-Box` where the user explicitly asked for link-priority consistency

## 6. Abstract policy

The two new abstracts must be:

- concise
- homepage-style
- source-grounded
- descriptive rather than promotional

They should summarize the paper contribution in one or two sentences and remain consistent with the tone already used in `data/publications.json`.

## 7. Verification requirements

1. Homepage publication data remains valid JSON.
2. The two target papers display non-empty abstracts and updated official links.
3. `Distill Yourself` project-facing links point to `https://quantaalpha.com/Distill-Yourself/`.
4. CV sources compile successfully after link changes.
5. No unrelated homepage routes or project pages regress.

## 8. Expected outcome

After this change:

- the two ACL 2026 collaboration papers have complete homepage metadata
- publication title links follow a clearer and more professional venue-first policy
- the CVs and homepage no longer disagree on key paper links
- `Distill Yourself` is consistently represented as a project with a homepage, not only a repository
- `projects/` keeps a clean scope boundary instead of becoming a paper list
