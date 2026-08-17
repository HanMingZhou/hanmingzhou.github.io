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

## GUI testing notes
- `xdotool type` (the computer-use `type` action) does not reliably enter CJK
  text into inputs — it can silently clear the field. Test Chinese-title search
  with an ASCII substring of the title (e.g. `hexo` for `HEXO博客的初步使用`)
  instead of typing Chinese.
- Maximize the browser with `wmctrl -r :ACTIVE: -b add,maximized_vert,maximized_horz`.

## Devin Secrets Needed
None — the site is fully static and runs locally without credentials.
