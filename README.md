# palli.site · പള്ളി

The landing page for [palli.site](https://palli.site), a home for small, free, open-source projects for the Malankara Orthodox Syrian Church. *Palli* means church.

Projects so far:

- **[This Sunday](https://sunday.palli.site/)** ([source](https://github.com/open-liturgy/thissunday)): one page for the coming Sunday, with the readings, a short explanation of the Gospel, a reflection and one question for the family.

## How it works

One static page, built by a small Node script with no dependencies.

- `projects.json` lists the projects. Each card on the page comes from one entry.
- `build.mjs` writes `dist/index.html` (CSS inlined, JSON-LD `WebSite` + `ItemList`), `404.html`, `robots.txt` and `sitemap.xml`, and copies `public/`.
- `public/` holds the fonts (Anek Malayalam and Newsreader, the subsets This Sunday uses), favicons, the social image and Cloudflare `_headers`.
- No JavaScript ships to the browser.

```sh
npm run build     # writes dist/
npm run preview   # builds and serves dist/ at http://localhost:4174
```

Node 18 or newer.

## Adding a project

Add an entry to `projects.json`:

```json
{
  "slug": "my-project",
  "name": "My Project",
  "nameMl": "Malayalam name (optional)",
  "url": "https://my-project.palli.site/",
  "source": "https://github.com/open-liturgy/my-project",
  "summary": "One or two sentences on what it is and who it is for.",
  "tags": ["Short", "facts"],
  "status": "Live",
  "ground": "#15183D",
  "glow": "#F4B544"
}
```

`slug`, `name`, `url` and `summary` are required; the build fails without them. `ground` and `glow` colour the card's art panel.

## Deploying (Cloudflare Pages)

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/`

The social image and icons in `public/` are checked in. If the design changes, regenerate them with `node scripts/images.mjs` (needs Playwright with Chromium).

## Licence

Code under the [MIT licence](LICENSE).
