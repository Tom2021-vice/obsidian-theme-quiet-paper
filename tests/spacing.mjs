/* Isolated CSS regression checks, NOT an Obsidian/CodeMirror integration test.
   Starts a fresh headless browser. Never connects to an existing application. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = await readFile(resolve(root, 'theme.css'), 'utf8');
// Only the native layout constraints needed to reproduce the reported bugs.
const base = `
body { font-size: 18px; --font-text: serif; --font-monospace: monospace; }
.cm-content { font-size: var(--font-text-size); line-height: var(--line-height-normal); }
.cm-line { min-height: 0; }
.markdown-source-view.mod-cm6 .cm-content > * { margin: 0 !important; display: block; }
.cm-s-obsidian .cm-line.HyperMD-header { padding-top: var(--p-spacing); }
.HyperMD-header-2 { font-size: var(--h2-size); line-height: var(--h2-line-height); }
.HyperMD-header-3 { font-size: var(--h3-size); line-height: var(--h3-line-height); }
.mod-cm6 .HyperMD-list-line.cm-line { padding-block: var(--list-spacing); }
.markdown-source-view.mod-cm6 .cm-preview-code-block pre { margin: 0; }
.markdown-source-view.mod-cm6 .cm-table-widget { --table-drag-handle-size: 16px; padding: var(--table-drag-handle-size); }
.markdown-source-view.mod-cm6 .cm-table-widget .cm-content { line-height: 1.35; }
.markdown-rendered pre { margin: 1em 0; }
`;

function editor(content, live = true) {
  return `<div class="markdown-source-view mod-cm6 cm-s-obsidian ${live ? 'is-live-preview' : ''}">
    <div class="cm-editor"><div class="cm-scroller"><div class="cm-sizer"><div class="cm-contentContainer"><div class="cm-content">${content}</div></div></div></div></div></div>`;
}
const fixture = editor(`
  <div id="first-heading" class="cm-line HyperMD-header HyperMD-header-2">标题</div>
  <div id="direct-heading" class="cm-line HyperMD-header HyperMD-header-3">子标题</div>
  <div id="list-item" class="cm-line HyperMD-list-line">• 一项说明</div>
  <div id="paragraph-blank" class="cm-line"><br></div>
  <div id="prose-before-code" class="cm-line">说明：</div>
  <div id="code-widget" class="cm-preview-code-block cm-embed-block markdown-rendered"><pre id="code-surface"><code>const x = 1;</code></pre></div>
  <div id="prose-after-code" class="cm-line">代码之后的正文。</div>
  <div id="table-heading" class="cm-line HyperMD-header HyperMD-header-2">表格标题</div>
  <div id="table-blank" class="cm-line"><br></div>
  <div id="table-widget" class="cm-table-widget cm-embed-block markdown-rendered"><table><tr><td><div class="table-cell-wrapper"><div class="cm-editor"><div class="cm-scroller"><div class="cm-content"><div id="cell-blank" class="cm-line"><br></div></div></div></div></div></td></tr></table></div>
  <div id="code-blank" class="cm-line HyperMD-codeblock"><br></div>
  <div id="quote-blank" class="cm-line HyperMD-quote"><br></div>
  <div id="list-blank" class="cm-line HyperMD-list-line"><br></div>
  <div id="active-blank" class="cm-line cm-active"><br></div>
  <div id="before-open-code" class="cm-line">编辑中的代码：</div>
  <div class="cm-line HyperMD-codeblock HyperMD-codeblock-begin">\x60\x60\x60js</div>
  <div class="cm-line HyperMD-codeblock">const y = 2;</div>
  <div class="cm-line HyperMD-codeblock HyperMD-codeblock-end">\x60\x60\x60</div>
  <div id="after-open-code" class="cm-line">编辑中的代码之后。</div>
  <div class="cm-line"><br></div>
  <div id="code-with-blanks" class="cm-preview-code-block cm-embed-block markdown-rendered"><pre><code>const z = 3;</code></pre></div>
  <div class="cm-line"><br></div>
`) + editor('<div id="source-blank" class="cm-line"><br></div>', false)
  + '<div class="markdown-reading-view"><div class="markdown-rendered"><p>正文</p><pre id="reading-code"><code>const a = 1;</code></pre><p>正文</p></div></div>';

const executablePath = process.env.QP_BROWSER_EXECUTABLE;
if (executablePath && /obsidian/i.test(executablePath)) throw new Error('This test must never launch Obsidian.');
const browser = await chromium.launch({
  headless: true,
  ...(executablePath ? { executablePath } : { channel: 'msedge' }),
});
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1100, height: 1800 } });
  // No network is needed: fonts and CSS are local/embedded.
  await context.route('**/*', route => route.abort());
  const page = await context.newPage();
  for (const palette of ['theme-light', 'theme-dark']) {
    await page.setContent(`<style>${base}</style><style>${theme}</style><body class="${palette}">${fixture}</body>`);
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
      return Object.fromEntries(ids.map(id => {
        const el = document.getElementById(id), s = getComputedStyle(el), r = el.getBoundingClientRect();
        return [id, { height: r.height, top: r.top, bottom: r.bottom, padTop: parseFloat(s.paddingTop), padBottom: parseFloat(s.paddingBottom), marginTop: parseFloat(s.marginTop), marginBottom: parseFloat(s.marginBottom), display: s.display }];
      }));
    });
    const check = (name, condition) => { assert.ok(condition, `${palette}: ${name}`); results.push({ palette, name, pass: true }); };
    check('code surface has breathing room after prose', metrics['code-surface'].top - metrics['prose-before-code'].bottom >= 8);
    check('prose has breathing room after code surface', metrics['prose-after-code'].top - metrics['code-surface'].bottom >= 8);
    check('list rows tighter than the old 36px pitch at 18px', metrics['list-item'].height < 32);
    check('title before body has an explicit lower gap', metrics['direct-heading'].padBottom >= 6);
    check('first heading has no extra top gap', metrics['first-heading'].padTop === 0);
    check('paragraph blank compact but not hidden', metrics['paragraph-blank'].height >= 6 && metrics['paragraph-blank'].height <= 14);
    check('heading blank compact but not hidden', metrics['table-blank'].height >= 6 && metrics['table-blank'].height <= 10);
    check('no duplicate padding before a source blank', metrics['table-heading'].padBottom === 0);
    check('table drag-control space preserved', metrics['table-widget'].padTop === 16);
    for (const id of ['active-blank', 'code-blank', 'quote-blank', 'list-blank', 'cell-blank', 'source-blank']) {
      check(`${id} retains a usable line box`, metrics[id].height >= 22 && metrics[id].display !== 'none');
    }
    check('editable code has outer spacing on preceding prose', metrics['before-open-code'].padBottom >= 8);
    check('editable code has outer spacing on following prose', metrics['after-open-code'].padTop >= 8);
    check('existing blank lines do not double widget padding', metrics['code-with-blanks'].padTop === 0 && metrics['code-with-blanks'].padBottom === 0);
    check('reading code separates both neighboring paragraphs', metrics['reading-code'].marginTop >= 8 && metrics['reading-code'].marginBottom >= 8);
    await page.locator('#table-blank').evaluate(el => el.classList.add('cm-active'));
    check('activating a compact blank restores its line box', (await page.locator('#table-blank').boundingBox()).height >= 24);
    await page.locator('body').evaluate(el => el.classList.add('qp-full-empty-lines'));
    check('full-height opt-out restores ordinary blank', (await page.locator('#paragraph-blank').boundingBox()).height >= 24);
  }
  await context.close();
} finally {
  await browser.close();
}
await mkdir(resolve(root, '.local'), { recursive: true });
await writeFile(resolve(root, '.local/spacing-checks.json'), JSON.stringify({ kind: 'isolated CSS fixture, not Obsidian integration', results }, null, 2));
console.log(`${results.length} isolated CSS checks passed. Obsidian/IME validation still requires user testing.`);
