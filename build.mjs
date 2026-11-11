// Builds the palli.site landing page into dist/. No dependencies: `node build.mjs`.
// To add a project, add an entry to projects.json and rebuild.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';

const SITE = 'https://palli.site';
const TITLE = 'palli.site: open-source projects for the Church';
const DESCRIPTION =
  'palli.site is a home for small, free, open-source projects for the Church, made for families, Sunday schools and parishes. Start with This Sunday, the weekly page for the coming Sunday.';
const ORG = 'https://github.com/open-liturgy';

const projects = JSON.parse(readFileSync('projects.json', 'utf8'));
for (const p of projects) {
  for (const key of ['slug', 'name', 'url', 'summary']) {
    if (!p[key]) throw new Error(`projects.json: "${p.slug ?? p.name ?? '?'}" is missing "${key}"`);
  }
}

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const host = (u) => new URL(u).host;

const arch = (stroke, dot, w = 2.4) =>
  `<svg viewBox="0 0 26 32" fill="none" aria-hidden="true"><path d="M1 32V13a12 12 0 0 1 24 0v19" stroke="${stroke}" stroke-width="${w}"/><circle cx="13" cy="15" r="4" fill="${dot}"/></svg>`;

const projectCard = (p) => `
<li class="project" style="--pg:${esc(p.ground ?? '#15183D')};--pc:${esc(p.glow ?? '#F4B544')}">
  <a class="project-art" href="${esc(p.url)}" tabindex="-1" aria-hidden="true">
    <svg class="arches" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path d="M40 200V100a60 60 0 0 1 120 0v100" stroke="currentColor" stroke-opacity=".22" stroke-width="1.5"/>
      <path d="M58 200V102a42 42 0 0 1 84 0v98" stroke="currentColor" stroke-opacity=".45" stroke-width="1.5"/>
      <path d="M76 200V104a24 24 0 0 1 48 0v96" stroke="currentColor" stroke-width="3"/>
      <circle cx="100" cy="108" r="8" fill="#E4502E"/>
    </svg>
  </a>
  <div class="project-body">
    <p class="project-meta">${p.status ? `<span class="status">${esc(p.status)}</span>` : ''}<span>${esc(host(p.url))}</span></p>
    <h3><a href="${esc(p.url)}">${esc(p.name)}</a>${p.nameMl ? ` <span lang="ml" class="ml">${esc(p.nameMl)}</span>` : ''}</h3>
    <p class="summary">${esc(p.summary)}</p>
    ${p.tags?.length ? `<ul class="tags" aria-label="About ${esc(p.name)}">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    <p class="actions">
      <a class="btn btn-primary" href="${esc(p.url)}">Open ${esc(p.name)} <span aria-hidden="true">→</span></a>
      ${p.source ? `<a class="btn btn-quiet" href="${esc(p.source)}">Source code<span class="sr-only"> for ${esc(p.name)}</span></a>` : ''}
    </p>
  </div>
</li>`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'palli.site',
      alternateName: 'പള്ളി',
      description: DESCRIPTION,
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'palli.site',
      url: `${SITE}/`,
      logo: `${SITE}/icon-512.png`,
      sameAs: [ORG],
    },
    {
      '@type': 'ItemList',
      name: 'Projects',
      itemListElement: projects.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'WebSite',
          name: p.name,
          ...(p.nameMl ? { alternateName: p.nameMl } : {}),
          url: p.url,
          description: p.summary,
          ...(p.source ? { codeRepository: p.source } : {}),
        },
      })),
    },
  ],
};

const fontFaces = `
@font-face{font-family:'Anek Malayalam';font-style:normal;font-weight:400 750;font-stretch:80% 100%;font-display:swap;src:url(/fonts/anek-latin-36fd1fba.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Anek Malayalam';font-style:normal;font-weight:400 600;font-stretch:90% 100%;font-display:swap;src:url(/fonts/anek-ml-3e741df0.woff2) format('woff2');unicode-range:U+0D00-0D7F,U+200C-200D,U+25CC}
@font-face{font-family:'Newsreader';font-style:normal;font-weight:400 500;font-display:swap;src:url(/fonts/newsreader-96b6356b.woff2) format('woff2');unicode-range:U+0000-00FF,U+2000-206F}`;

const css = `${fontFaces}
:root{--ink:#15183d;--glow:#f4b544;--vermilion:#e4502e;--red:#c23a22;--paper:#f5f6fa;--card:#fff;--rule:#d9dcea;--text-2:#4b5173;--label:#5c6288;--on-dark:#c9cce6;--on-dark-2:#a4a9d1;--sans:'Anek Malayalam','Noto Sans Malayalam',system-ui,-apple-system,'Segoe UI',sans-serif;--serif:'Newsreader',Georgia,'Times New Roman',serif;--gutter:clamp(16px,5vw,72px);--max:1120px;color-scheme:light}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.55;overflow-x:hidden}
h1,h2,h3,p,ul{margin:0}
ul{padding:0;list-style:none}
a{color:inherit}
:focus-visible{outline:3px solid var(--red);outline-offset:3px;border-radius:4px}
.hero :focus-visible{outline-color:var(--glow)}
.sr-only{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:12px;top:-100px;z-index:10;padding:10px 16px;background:#fff;color:var(--ink);border-radius:8px;font-weight:650}
.skip:focus{top:12px}
.wrap{max-width:var(--max);margin:0 auto;padding:0 var(--gutter)}
.label{font-size:13px;font-weight:650;letter-spacing:.12em;text-transform:uppercase;color:var(--label)}

.hero{position:relative;overflow:hidden;background:var(--ink);color:#fff;padding-bottom:clamp(56px,9vw,120px)}
.hero-arches{position:absolute;right:max(-120px,calc(50% - 760px));bottom:-2px;width:min(620px,78vw);height:auto;color:var(--glow);pointer-events:none}
.topbar{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px;padding-top:28px}
.brand{display:flex;align-items:center;gap:12px;min-height:44px;text-decoration:none}
.brand svg{width:22px;height:27px;flex:none}
.brand b{font-size:21px;font-weight:700;letter-spacing:-.01em}
.brand span{font-size:15px;color:var(--on-dark-2);font-weight:500}
.topnav a{display:inline-flex;align-items:center;min-height:44px;color:var(--on-dark);font-size:15px;font-weight:500;text-decoration:none}
.topnav a:hover{color:#fff;text-decoration:underline;text-underline-offset:4px}
.hero-copy{position:relative;max-width:700px;padding-top:clamp(56px,10vw,128px)}
.eyebrow{color:var(--glow)}
.hero h1{margin-top:14px;font-size:clamp(40px,7vw,76px);line-height:1.02;font-weight:700;letter-spacing:-.025em;font-stretch:90%}
.hero h1 em{font-style:normal;color:var(--glow)}
.lede{margin-top:24px;max-width:600px;font-family:var(--serif);font-size:clamp(19px,2.2vw,23px);line-height:1.45;color:var(--on-dark)}
.lede span[lang=ml]{font-family:var(--sans);color:#fff}

.projects{padding:clamp(48px,7vw,88px) 0 clamp(56px,8vw,104px)}
.section-head{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px 24px;padding-bottom:20px;border-bottom:1px solid var(--rule)}
.section-head h2{font-size:clamp(26px,3.4vw,34px);font-weight:700;letter-spacing:-.015em}
.section-head p{color:var(--text-2);font-size:15px}
.project-list{display:grid;gap:24px;margin-top:32px}
.project{display:grid;grid-template-columns:minmax(0,260px) minmax(0,1fr);background:var(--card);border:1px solid var(--rule);border-radius:20px;overflow:hidden;box-shadow:0 1px 2px rgba(21,24,61,.04),0 12px 32px -18px rgba(21,24,61,.25)}
.project-art{display:flex;align-items:flex-end;justify-content:center;background:var(--pg);color:var(--pc);min-height:240px}
.project-art .arches{width:78%;max-width:220px;height:auto;display:block}
.project-body{padding:clamp(24px,3.5vw,40px)}
.project-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;font-size:14px;color:var(--label)}
.status{display:inline-flex;align-items:center;gap:7px;padding:3px 11px 2px;border-radius:999px;background:#e7f4ec;color:#1d6b3e;font-weight:650;font-size:13px}
.status::before{content:'';width:7px;height:7px;border-radius:50%;background:#2e9d5d}
.project h3{margin-top:12px;font-size:clamp(28px,3.4vw,36px);line-height:1.1;font-weight:700;letter-spacing:-.015em}
.project h3 a{text-decoration:none}
.project h3 a:hover{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px}
.project h3 .ml{display:inline-block;margin-left:6px;font-size:.62em;font-weight:500;color:var(--label);letter-spacing:0}
.summary{margin-top:12px;max-width:62ch;color:var(--text-2)}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.tags li{padding:4px 12px 3px;border:1px solid var(--rule);border-radius:999px;font-size:14px;color:var(--text-2)}
.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:46px;padding:0 20px;border-radius:999px;font-weight:650;text-decoration:none;font-size:16px}
.btn-primary{background:var(--ink);color:#fff}
.btn-primary:hover{background:#262a5c}
.btn-quiet{border:1px solid #c9cde0;color:var(--ink)}
.btn-quiet:hover{border-color:var(--ink)}
.more{margin-top:28px;color:var(--text-2);font-size:16px}
.more a{color:var(--ink);font-weight:600;text-underline-offset:3px}
.more a:hover{color:var(--red)}

footer{border-top:1px solid var(--rule);padding:28px 0 40px;font-size:15px;color:var(--text-2)}
footer .wrap{display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between}
footer a{color:var(--ink);text-underline-offset:3px}
footer a:hover{color:var(--red)}

@media (max-width:720px){
  .hero-arches{display:none}
  .project{grid-template-columns:1fr}
  .project-art{min-height:0;aspect-ratio:16/7}
  .project-art .arches{width:auto;height:100%;max-width:none}
  .topnav .long{display:none}
  .actions .btn{flex:1 1 auto}
}
@media (prefers-reduced-motion:no-preference){.btn,.project h3 a{transition:background-color .15s,border-color .15s}}
`;

const count = projects.length;
const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITLE)}</title>
<meta name="description" content="${esc(DESCRIPTION)}">
<link rel="canonical" href="${SITE}/">
<meta name="theme-color" content="#15183D">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/fonts/anek-latin-36fd1fba.woff2" as="font" type="font/woff2" crossorigin>
<meta property="og:type" content="website">
<meta property="og:site_name" content="palli.site">
<meta property="og:title" content="palli.site">
<meta property="og:description" content="Small, free, open-source projects for the Church. Start with This Sunday, the weekly page for the coming Sunday.">
<meta property="og:url" content="${SITE}/">
<meta property="og:locale" content="en_IN">
<meta property="og:image" content="${SITE}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="palli.site, open-source projects for the Church, with a gold arch on deep blue.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="palli.site">
<meta name="twitter:description" content="Small, free, open-source projects for the Church.">
<meta name="twitter:image" content="${SITE}/og.png">
<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>
<style>${css.replace(/\n\s*/g, '\n').trim()}</style>
</head>
<body>
<a class="skip" href="#projects">Skip to projects</a>
<header class="hero">
  <svg class="hero-arches" viewBox="0 0 620 520" fill="none" aria-hidden="true">
    <path d="M70 520V310a240 240 0 0 1 480 0v210" stroke="currentColor" stroke-opacity=".10" stroke-width="2"/>
    <path d="M140 520V318a170 170 0 0 1 340 0v202" stroke="currentColor" stroke-opacity=".18" stroke-width="2"/>
    <path d="M210 520V326a100 100 0 0 1 200 0v194" stroke="currentColor" stroke-opacity=".5" stroke-width="3"/>
    <circle cx="310" cy="336" r="20" fill="#E4502E" fill-opacity=".9"/>
  </svg>
  <div class="wrap">
    <nav class="topbar" aria-label="Site">
      <a class="brand" href="/">${arch('#F4B544', '#E4502E')}<b>palli.site</b><span lang="ml">പള്ളി</span></a>
      <p class="topnav"><a href="${ORG}"><span class="long">Open source on&nbsp;</span>GitHub</a></p>
    </nav>
    <div class="hero-copy">
      <p class="label eyebrow">Open source · Made for the parish</p>
      <h1>Small, open tools for the <em>Church</em>.</h1>
      <p class="lede"><span lang="ml">പള്ളി</span> means church. This is a home for free projects that a family, a Sunday school or a parish can use every week, made in the open by people who love the Church.</p>
    </div>
  </div>
</header>
<main id="projects" class="projects" tabindex="-1">
  <div class="wrap">
    <div class="section-head">
      <h2>Projects</h2>
      <p>${count === 1 ? 'One project so far, more on the way' : `${count} projects`}</p>
    </div>
    <ul class="project-list">${projects.map(projectCard).join('')}
    </ul>
    <p class="more">Have an idea, or want to help? Everything is on <a href="${ORG}">GitHub at open-liturgy</a>.</p>
  </div>
</main>
<footer>
  <div class="wrap">
    <p>palli.site · Code under the <a href="${ORG}/palli.site/blob/main/LICENSE">MIT licence</a></p>
    <p><a href="${ORG}/palli.site">Source for this page</a></p>
  </div>
</footer>
</body>
</html>
`;

const notFound = `<!doctype html>
<html lang="en-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Page not found · palli.site</title><meta name="robots" content="noindex"><link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>${fontFaces}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#15183d;color:#fff;font-family:'Anek Malayalam',system-ui,sans-serif;text-align:center;padding:24px}svg{width:44px;height:54px}h1{font-size:32px;margin:20px 0 8px}p{color:#c9cce6;margin:0}a{color:#f4b544;font-weight:600}</style></head>
<body><main>${arch('#F4B544', '#E4502E')}<h1>Page not found</h1><p>Go to <a href="/">palli.site</a> or <a href="https://sunday.palli.site/">This Sunday</a>.</p></main></body></html>
`;

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
writeFileSync('dist/index.html', html);
writeFileSync('dist/404.html', notFound);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc></url>\n</urlset>\n`,
);
console.log(`Built dist/ with ${count} project${count === 1 ? '' : 's'}.`);
