---
name: testing-hexo-particlex
description: How to run and browser-test this Hexo blog locally with the ParticleX theme (server startup, URL map, theme-config gotchas).
---

# Testing this Hexo + ParticleX blog locally

## Start the site
```bash
cd <repo root>
npm install            # only if node_modules missing
npx hexo clean && npx hexo server   # serves http://localhost:4000
```
`hexo server` regenerates on file change; after editing `_config.yml` or
`_config.particlex.yml` restart the server (theme config is read at boot).

## Route map (verify with curl before opening the browser)
- `/` home (background + avatar + info card + post list)
- `/posts/<abbrlink>/` posts — abbrlinks come from the `abbrlink:` front-matter,
  so URLs are stable regardless of title/date changes
- `/archives/`, `/categories/`, `/tags/`, `/about/`
Quick check: `for u in / /archives/ /categories/ /tags/ /about/; do curl -s -o /dev/null -w "$u %{http_code}\n" http://localhost:4000$u; done`

## External dependencies to check first
Theme assets are CDN-hosted (`themes/particlex/layout/import.ejs`):
Vue, Font Awesome 6, Highlight.js (+line-numbers), Google Fonts (fonts.googleapis.cn),
polyfill.alicdn.com. Post images use `files.catbox.moe`.
If icons show as tofu boxes or code blocks are unstyled, first curl the CDN URLs —
a blocked network is an environment issue, not a theme bug.

## ParticleX-specific gotchas
- **Theme config is deep-merged, not replaced.** Keys you add in
  `_config.<theme>.yml` merge over `themes/<theme>/_config.yml`; keys that exist
  only in the theme's own file survive. Consequence: translating the `menu:` keys
  (e.g. `Home:` -> `首页:`) leaves BOTH menus in the nav bar. Same risk applies to
  `card.friendLinks` and any other map key. Fix by editing/emptying the keys in
  `themes/<theme>/_config.yml` (or overriding each original key to null).
- Hexo's builtin highlighter must be off (`syntax_highlighter:` empty) so
  Highlight.js can take over; the rendered code block becomes a `<table>` with
  line numbers plus a language pill (e.g. `go`) — that table markup is expected.
- Archives search (`theme.search.enable`) filters client-side on lowercased,
  space-stripped titles only (`themes/particlex/layout/archives.ejs`).
- Image click-preview (`theme.preview.enable`) appends a full-screen `<img>` to
  the page body; click the backdrop to dismiss.

## Widget testing notes (read-time / vercount / APlayer / giscus)
Config for these lives in `_config.particlex.yml`; **every change needs a server
restart**, and a plain `pkill -f "hexo server"` + relaunch often leaves the old
process alive serving stale config. Reliable pattern:
```bash
pkill -f "hexo server"; sleep 2; pgrep -af hexo    # confirm nothing is left
cd <repo root> && setsid nohup npx hexo server > /tmp/hexo.log 2>&1 < /dev/null &
curl -s http://localhost:4000/posts/<abbrlink>/ | grep -c giscus   # prove the new config is live
```
Always verify the served HTML reflects the edit before judging the UI.
- `hexo-symbols-count-time` assigns `length`/`symbolsCount` to **pages too**
  (e.g. `/about/`), so a `page.length` guard will NOT hide the 字/分钟 block on
  pages. If pages must be excluded, gate on `page.layout === 'post'` instead.
- Vercount (`https://cn.vercount.one/js`) backfills `#vercount_value_site_pv|_uv|_page_pv`;
  locally it counts `localhost`, so expect huge shared numbers — only check that
  the `-` placeholders became digits and no JS error appears.
- APlayer + Meting: `music.js` fetches the Meting API then constructs APlayer. To
  test the failure path, point `music.api` at an unreachable host, restart, and
  confirm `#music` is removed rather than leaving an empty shell.
- `fixed: true` APlayer renders bottom-**left** by default and its lyrics panel can
  overlap the footer; check the very bottom of a long post page for overlap.
- **APlayer puts its `aplayer` classes on the container element itself**, so `#music`
  *is* the `.aplayer` element. Descendant CSS like `#music .aplayer.aplayer-fixed` never
  matches — the working form is same-element `#music.aplayer.aplayer-fixed` (also for
  `.aplayer-body` / `.aplayer-lrc` overrides). Verify at runtime with
  `getComputedStyle(document.getElementById('music')).left` (`auto` = right-anchored)
  and `getBoundingClientRect().right ≈ innerWidth`.
- After right-anchoring a fixed player, check the **expanded** state too: upstream
  APlayer ships `.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body { width:66px!important }`,
  which can leave the expanded player as a ~66px white sliver with the title/controls/
  playlist clipped off-screen. Symptom check:
  `getComputedStyle(document.querySelector('#music .aplayer-body')).width` staying `66px`
  while the player looks "open". A width override on the body may be needed in theme CSS.
- With `music.lrc: true`, the `.aplayer-lrc` overlay is `position:fixed; bottom:10px; z-index:98`
  while the body is z-index 99 — right-aligned lyrics can end up hidden *behind* the player
  itself. Inspect the `.aplayer-lrc-current` rect vs the body rect, not just the screenshot.
- NetEase member/exclusive tracks return a **30-second trial** audio via Meting; if a
  duration shows `00:30`, suspect the source rather than the player. Pick `fee: 0` tracks
  and confirm with `ffprobe` or the displayed total duration (e.g. 04:20 / 03:33).
- Multi-source `music.list` testing: put one valid + one bogus id (e.g. `999999999999`,
  Meting answers `{"error":"unknown song"}`) → player must survive with only the valid
  track and no phantom row; make all ids bogus → `document.getElementById('music')`
  must be `null` with zero `.aplayer` nodes. Restart the server after every config edit
  and confirm the served `data-config` before judging the UI.
- giscus: with `giscus.enable: false` the post HTML should contain zero `giscus`
  occurrences. To smoke-test the template, temporarily set `enable: true` with a
  fake `categoryID` (e.g. `DIC_kwDOTESTFAKE`); giscus will log
  "giscus is not installed on this repository" — that is expected, a Hexo/EJS
  error page is not. Revert afterwards and do not commit.
- The browser console buffer is cumulative across the session; giscus errors from
  a temporary-enable test persist after reverting — re-check the DOM, not the log.

## GUI testing notes
- `xdotool type` (the computer-use `type` action) does not reliably enter CJK
  text into inputs — it can silently clear the field. Test Chinese-title search
  with an ASCII substring of the title (e.g. `hexo` for `HEXO博客的初步使用`)
  instead of typing Chinese.
- Maximize the browser with `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.

## Devin Secrets Needed
None — the site is fully static and runs locally without credentials.
