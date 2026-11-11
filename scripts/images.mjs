// Regenerates the social image and icons in public/. Not part of the build:
// run it only when the design changes. Needs Playwright (npx playwright install chromium).
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(root + 'scripts/og.html').href);
await page.evaluate(() => document.fonts.ready);
await page.locator('.c').screenshot({ path: root + 'public/og.png' });

const icon = readFileSync(root + 'public/favicon.svg', 'utf8');
for (const [name, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-512.png', 512]]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${icon}`);
  await p.screenshot({ path: root + 'public/' + name, omitBackground: name !== 'apple-touch-icon.png' });
  await p.close();
}
await browser.close();
console.log('Wrote public/og.png and icons.');
