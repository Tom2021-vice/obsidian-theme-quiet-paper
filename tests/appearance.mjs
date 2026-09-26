/* Static CSS checks and review images, not an Obsidian integration test.
   Native constraints are reproduced below; no app, vault or session is opened. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = await readFile(resolve(root, 'theme.css'), 'utf8');
const { version } = JSON.parse(await readFile(resolve(root, 'manifest.json'), 'utf8'));
const output = resolve(root, '.local/review');
await mkdir(output, { recursive: true });
const native = `
body { --font-text-size: 18px; --font-text: var(--font-text-theme); --font-monospace: Consolas, monospace; --code-border-width: 0px; --code-border-color: transparent; --tab-radius-active: 6px 6px 0 0; --tab-outline-width: 0px; --tab-curve: 6px; --nav-item-background-hover: var(--background-modifier-hover); --nav-item-background-selected: var(--text-selection); }
.markdown-rendered { font-family: var(--font-text); font-size: var(--font-text-size); line-height: var(--line-height-normal); }
.markdown-rendered blockquote { color: var(--blockquote-color); background: var(--blockquote-background-color); border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color); margin-inline: 0; }
.markdown-rendered blockquote > :first-child { margin-top: 0; }
.markdown-rendered blockquote > :last-child { margin-bottom: 0; }
.cm-line { position: relative; line-height: var(--line-height-normal); font-size: var(--font-text-size); font-family: var(--font-text); }
.markdown-source-view.mod-cm6 .cm-content > * { margin: 0 !important; display: block; }
.markdown-source-view.mod-cm6.is-live-preview .HyperMD-quote { background: var(--blockquote-background-color); padding-inline-start: 1em; color: var(--blockquote-color); }
.markdown-source-view.mod-cm6.is-live-preview .HyperMD-quote::before { content: ''; position: absolute; inset: 0 auto 0 0; border-inline-start: var(--blockquote-border-thickness) solid var(--blockquote-border-color); }
.markdown-rendered code, .cm-s-obsidian span.cm-inline-code { color: var(--code-normal); background: var(--code-background); font-family: var(--font-monospace); font-size: var(--code-size); border: var(--code-border-width) solid var(--code-border-color); border-radius: var(--code-radius); padding: .15em .3em; -webkit-box-decoration-break: clone; }
.markdown-rendered pre { color: var(--code-normal); background: var(--code-background); border-radius: var(--code-radius); }
.markdown-rendered pre code { border: none; padding: 0; }
.cm-inline-code.cm-formatting { border-radius: var(--code-radius) 0 0 var(--code-radius); }
.cm-inline-code:not(.cm-formatting) + .cm-formatting.cm-inline-code { border-radius: 0 var(--code-radius) var(--code-radius) 0; }
.cm-inline-code.cm-formatting ~ .cm-inline-code:not(.cm-formatting) { border-radius: 0; }
.tree-item-self { display: flex; align-items: center; position: relative; padding: 6px 8px 6px 20px; color: var(--nav-item-color, var(--text-muted)); }
.tree-item-self.is-clickable:hover { background: var(--nav-item-background-hover); }
.tree-item-self.is-active, .tree-item-self.is-active:hover { color: var(--nav-item-color-active); background: var(--nav-item-background-active); }
.tree-item-self.is-selected { background: var(--nav-item-background-selected); }
.tree-item-self.has-focus { box-shadow: 0 0 0 2px var(--interactive-accent); }
.tree-item-self.is-being-dragged { color: var(--text-on-accent); background: var(--interactive-accent); }
.tree-item-children { margin-inline-start: 12px; padding-inline-start: 7px; border-inline-start: var(--nav-indentation-guide-width, 0px) solid var(--nav-indentation-guide-color, transparent); }
.nav-folder.is-collapsed > .nav-folder-children { display: none; }
.nav-folder-collapse-indicator { position: absolute; left: 5px; font-size: 10px; }
.nav-folder-title-content, .nav-file-title-content { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.workspace-tab-header-container { display: flex; padding: 10px 14px 0; gap: 16px; }
.workspace-tab-header-container .workspace-tab-header { position: relative; border-radius: var(--tab-radius-active); padding: 10px 14px; min-width: 220px; }
.workspace-tab-header-container .workspace-tab-header.is-active { box-shadow: 0 0 0 var(--tab-outline-width) var(--tab-outline-color); background: var(--tab-background-active); }
.workspace-tab-header-inner { display: flex; justify-content: space-between; gap: 40px; }
.workspace-tab-header-inner-close-button { border: 0; background: transparent; color: inherit; font-size: 18px; }
`;
// Layout belongs to this review sheet only, not to the shipped theme.
const sheet = `
* { box-sizing: border-box; }
body { margin: 0; color: var(--text-normal); background: var(--qp-desk); font: 15px 'Segoe UI', 'Microsoft YaHei UI', sans-serif; }
.review-label { padding: 14px 24px; font-size: 12px; color: var(--text-muted); border-bottom: 1px solid var(--divider-color); }
.review-layout { display: grid; grid-template-columns: 284px 1fr; min-height: 810px; }
aside { padding: 12px; background: var(--background-secondary); border-right: 1px solid var(--divider-color); }
main { padding: 26px 38px; }
article { padding: 24px 30px; background: var(--qp-paper); border-radius: 12px; box-shadow: var(--qp-paper-shadow); }
.review-caption { margin: 20px 0 8px; font-size: 12px; font-family: 'Segoe UI', 'Microsoft YaHei UI', sans-serif; color: var(--text-muted); }
.review-layout h2 { margin: 0 0 22px; font-size: 27px; }
.review-layout p { margin: 12px 0; }
.review-layout table { width: 100%; border-collapse: collapse; }
.review-layout th, .review-layout td { border: 1px solid var(--background-modifier-border); padding: 9px; text-align: left; }
.review-layout th { background: var(--table-header-background); }
.nav-folder.mod-root > .nav-folder-children { margin: 0; padding: 0; border: none; }
.test-only { position: absolute; left: -5000px; width: 300px; }
`;
const file = (id, name, active = false) => `<div class="nav-file"><div id="${id}" class="tree-item-self nav-file-title is-clickable${active ? ' is-active' : ''}"><span class="nav-file-title-content">${name}</span></div></div>`;
const folder = (i, title, contents = '') => `<div id="group-${i}" class="nav-folder tree-item${contents ? '' : ' is-collapsed'}"><div id="folder-${i}" class="nav-folder-title tree-item-self is-clickable"><span class="nav-folder-collapse-indicator">${contents ? '⌄' : '›'}</span><span class="nav-folder-title-content">${title}</span></div><div class="nav-folder-children tree-item-children">${contents}</div></div>`;
const nested = `<div id="nested-group" class="nav-folder"><div id="nested-folder" class="nav-folder-title tree-item-self is-clickable"><span class="nav-folder-collapse-indicator">⌄</span><span class="nav-folder-title-content">02 内容沉淀</span></div><div class="nav-folder-children tree-item-children">${file('active-file', 'VPS 日常维护', true)}${file('other-file', 'Obsidian 入门')}</div></div>`;
const tab = `<div class="workspace-tab-header-container"><div id="active-tab" class="workspace-tab-header is-active"><div class="workspace-tab-header-inner"><span class="workspace-tab-header-inner-title">VPS 日常维护</span><button class="workspace-tab-header-inner-close-button" aria-label="关闭">×</button></div></div><div class="workspace-tab-header">＋</div></div>`;
const editor = `<div class="markdown-source-view mod-cm6 is-live-preview cm-s-obsidian"><div class="cm-editor"><div class="cm-scroller"><div class="cm-sizer"><div class="cm-contentContainer"><div class="cm-content"><div id="live-quote" class="cm-line HyperMD-quote">先观察，再决定；每次变更留下记录。</div><div id="live-quote-last" class="cm-line HyperMD-quote">多行引用共用连续的背景和边条。</div><div class="cm-line">配置文件：<span id="live-code" class="cm-inline-code">~/docker/npm/compose.yml</span></div></div></div></div></div></div></div>`;
const fixture = `<div class="review-label">Quiet Paper ${version} · 静态样式样张（非 Obsidian 实机截图）</div><div class="workspace"><div class="workspace-split mod-root"><div class="workspace-tabs">${tab}</div></div></div><div class="review-layout"><aside class="workspace-leaf-content" data-type="file-explorer"><div class="nav-files-container"><div class="nav-folder mod-root"><div class="nav-folder-children">${folder(1, '00 Dashboard')}${file('loose-file', '收件箱')}${folder(2, '01 知识管理', nested)}${folder(3, '02 任务管理')}${folder(4, '03 信息管理')}${folder(5, '04 研究工作')}${folder(6, '05 项目归档')}${folder(7, '06 阅读笔记')}${folder(8, '07 灵感收集')}</div></div></div></aside><main><article><div class="markdown-rendered"><h2>更清楚，也更安静。</h2><blockquote id="reading-quote"><p>当前维护策略：稳定优先、人工判断更新，重大操作保留回滚点。</p></blockquote><p>将配置保存到 <code id="reading-code">~/docker/npm/compose.yml</code>，然后记录变更。</p><table><tr><th>项目</th><th>配置位置</th></tr><tr><td>配置路径</td><td><code id="table-code">~/docker/npm/compose.yml</code></td></tr></table><p class="review-caption">多行代码继续保留独立的语法配色</p><pre><code id="fenced-code">const message = 'Quiet Paper';<br>console.log(message);</code></pre></div><p class="review-caption">实时预览的引用与行内代码 · 静态结构对照</p>${editor}</article></main></div><div class="test-only"><div class="workspace-leaf-content" data-type="outline"><div class="nav-folder"><div id="outline-folder" class="nav-folder-title">不应被目录样式影响</div></div></div><div class="workspace-leaf-content" data-type="file-explorer"><div id="existing-icon" class="nav-file-title"><span class="nav-file-icon">◇</span>已有图标</div></div><div class="workspace"><div class="mod-root"><div class="workspace-tabs mod-stacked"><div class="workspace-tab-header-container"><div id="stacked-tab" class="workspace-tab-header is-active">叠放</div></div></div></div></div></div>`;

function contrast(a, b) {
  const lum = color => color.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => color.startsWith('color(srgb ') ? v : v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
  const x = lum(a), y = lum(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
const executablePath = process.env.QP_BROWSER_EXECUTABLE;
if (executablePath && /obsidian/i.test(executablePath)) throw new Error('Never launch Obsidian for this fixture.');
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : { channel: 'msedge' }) });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1150, height: 950 }, deviceScaleFactor: 1 });
  await context.route('**/*', route => route.abort());
  const page = await context.newPage();
  const style = async (id, pseudo = null) => page.locator(`#${id}`).evaluate((el, pseudo) => {
    const s = getComputedStyle(el, pseudo);
    return { color: s.color, bg: s.backgroundColor, border: parseFloat(s.borderLeftWidth), radius: parseFloat(s.borderTopLeftRadius), endRadius: parseFloat(s.borderTopRightRadius), shadow: s.boxShadow, content: s.content, mask: s.maskImage, display: s.display, pointer: s.pointerEvents, wrap: s.overflowWrap, font: s.fontWeight };
  }, pseudo);
  // 1.13.7 source creates an unclassed div directly in nav-files-container.
  // Its pusher and top-level folders are siblings; no nav-folder.mod-root exists.
  // Keep the old structure as a compatibility fixture, not the only fixture.
  for (const layout of ['virtual-root', 'legacy-root']) {
    for (const palette of ['theme-light', 'theme-dark']) {
      const html = `<meta charset="utf-8"><style>${native}</style><style>${theme}</style><style>${sheet}</style><body class="${palette}">${fixture}</body>`;
      await page.setContent(html);
      if (layout === 'virtual-root') {
        await page.locator('.nav-folder.mod-root').evaluate(root => {
          const children = root.querySelector(':scope > .nav-folder-children');
          children.removeAttribute('class');
          root.replaceWith(children);
          const pusher = document.createElement('div');
          pusher.style.height = '0px';
          children.prepend(pusher);
        });
      }
      await page.evaluate(() => document.fonts.ready);
      const check = (name, condition) => { assert.ok(condition, `${layout}/${palette}: ${name}`); results.push({ layout, palette, name, pass: true }); };
      const quote = await style('reading-quote'), liveQuote = await style('live-quote');
      check('quote has substantial edge and visible surface', quote.border >= 4 && quote.bg !== 'rgba(0, 0, 0, 0)');
      check('reading and live quotes share palette', quote.bg === liveQuote.bg && quote.color === liveQuote.color);
      check('live quote edge matches reading edge', (await style('live-quote', '::before')).border === quote.border);
      check('quote text contrast at least 4.5', contrast(quote.color, quote.bg) >= 4.5);
      const code = await style('reading-code'), liveCode = await style('live-code'), fence = await style('fenced-code');
      check('inline code is distinct from fenced code', code.color !== fence.color && code.bg !== fence.bg);
      check('both views share inline color and background', code.color === liveCode.color && code.bg === liveCode.bg);
      check('inline text contrast at least 4.5', contrast(code.color, code.bg) >= 4.5);
      check('inline chip has border and rounded corners', code.border >= 1 && code.radius >= 5);
      check('table paths retain wrapping', (await style('table-code')).wrap === 'anywhere');
      check('group border visible and rounded', (await style('group-2')).border === 3 && (await style('group-2')).radius >= 7);
      check('nested branch does not get a second group border', (await style('nested-group')).border === 0);
      const groupColors = [];
      for (let i = 1; i <= 8; i++) {
        groupColors.push((await style(`folder-${i}`)).color);
        check(`folder ${i} text contrast at least 4.5`, contrast(groupColors[i - 1], (await style(`group-${i}`)).bg) >= 4.5);
      }
      check('eight top-level folder colors', new Set(groupColors).size === 8);
      check('descendant folder inherits branch color', (await style('nested-folder')).color === groupColors[1]);
      check('active file is filled and outlined', (await style('active-file')).shadow !== 'none' && (await style('active-file')).bg !== 'rgba(0, 0, 0, 0)');
      check('folder icon differs from document icon', (await style('folder-2', '::before')).mask !== (await style('other-file', '::before')).mask);
      const openFolderMask = (await style('folder-2', '::before')).mask;
      check('decorative file icon cannot intercept clicks', (await style('other-file', '::before')).pointer === 'none');
      check('native icon is not duplicated', (await style('existing-icon', '::before')).content === 'none');
      check('outline is not styled as file explorer', (await style('outline-folder', '::before')).content === 'none');
      check('rounded primary tab', (await style('active-tab')).radius >= 12);
      check('stacked tab keeps native radius', (await style('stacked-tab')).radius === 6);
      check('close button remains available', await page.getByRole('button', { name: '关闭' }).isVisible());
      await page.screenshot({ path: resolve(output, `appearance-${layout}-${palette}.png`), fullPage: true });
      await writeFile(resolve(output, `appearance-${layout}-${palette}.html`), await page.content());
      // Exercise CSS state changes, without pretending to test actual tree logic.
      const oldColor = (await style('folder-2')).color;
      await page.locator('#loose-file').evaluate(el => el.closest('.nav-file').remove());
      check('loose files do not shift group palette', (await style('folder-2')).color === oldColor);
      await page.locator('#group-2').evaluate(el => el.classList.add('is-collapsed'));
      check('collapsed folder changes its icon', (await style('folder-2', '::before')).mask !== openFolderMask);
      check('native collapse display is preserved', await page.locator('#group-2 > .nav-folder-children').evaluate(el => getComputedStyle(el).display) === 'none');
      await page.locator('#group-2').evaluate(el => el.classList.remove('is-collapsed'));
      await page.locator('#active-file').evaluate(el => el.classList.add('has-focus'));
      check('keyboard focus outline is preserved', (await style('active-file')).shadow.includes('2px'));
      await page.locator('#active-file').evaluate(el => { el.classList.remove('has-focus'); el.classList.add('is-being-dragged'); });
      check('drag feedback is not covered by active outline', (await style('active-file')).shadow === 'none');
      await page.locator('body').evaluate(el => el.classList.add('qp-plain-folders'));
      check('plain directory switch removes group framing', (await style('group-2')).border === 0);
      check('plain directory switch removes decorative icons', (await style('other-file', '::before')).content === 'none');
      await page.locator('body').evaluate(el => el.classList.add('is-mobile'));
      check('mobile tabs keep native radius', (await style('active-tab')).radius === 6);
    }
  }
  await context.close();
} finally { await browser.close(); }
await writeFile(resolve(output, 'appearance-checks.json'), JSON.stringify({ kind: 'static CSS fixture, not Obsidian integration', results }, null, 2));
console.log(`${results.length} appearance checks passed; review images saved under .local/review.`);
