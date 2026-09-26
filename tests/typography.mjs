/* Static native-style fixtures, not an Obsidian or CodeMirror integration test. */
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const theme = await readFile(resolve(root, 'theme.css'), 'utf8');
const output = resolve(root, '.local/review');
await mkdir(output, { recursive: true });
// App-owned defaults precede theme CSS, so accidental theme overrides are detected.
const native = `
body { --background-modifier-hover:rgba(128,128,128,.1); --font-text-size:18px; --font-interface-theme:Arial; --font-monospace-theme:monospace; --font-interface:var(--font-interface-theme); --font-monospace:var(--font-monospace-theme); --font-text:var(--font-text-theme); }
.markdown-rendered, .markdown-source-view { font:var(--font-text-size)/var(--line-height-normal) var(--font-text); }
p { margin-block:var(--p-spacing); }
${[1,2,3,4,5,6].map(n => `h${n}, .HyperMD-header-${n} { font-size:var(--h${n}-size); font-weight:var(--h${n}-weight); color:var(--h${n}-color, var(--text-normal)); line-height:var(--h${n}-line-height); }`).join('\n')}
table { font-size:var(--table-text-size); }
th, td { border:1px solid var(--background-modifier-border); padding:var(--table-cell-padding); }
th { background:var(--table-header-background); font-weight:var(--table-header-weight); }
tbody tr:nth-child(odd) { background:var(--table-row-alt-background); }
.cm-table-widget th, .cm-table-widget td { padding:0; }
.callout { --callout-color:var(--callout-default); margin:1em 0; }
${['info','tip','warning','success','error'].map(type => `.callout[data-callout=${type}] { --callout-color:var(--callout-${type}); }`).join('\n')}
.callout[data-callout=danger] { --callout-color:var(--callout-error); }
.callout[data-callout=custom] { --callout-color:#9675a0; }
.callout-title { color:var(--callout-color); display:flex; gap:.5em; }
.callout.is-collapsed .callout-content { display:none; }
ul.has-list-bullet { list-style-type:'\\200B'; }
ul.has-list-bullet > li::marker { color:transparent; }
li { position:relative; }
li::marker { color:var(--list-marker-color); }
.list-bullet { position:relative; display:inline-flex; width:1em; height:1em; align-items:center; justify-content:center; }
.list-bullet::after { content:''; position:absolute; pointer-events:none; width:var(--list-bullet-size); height:var(--list-bullet-size); background:var(--list-marker-color); border-radius:50%; }
.task-list-item > .list-bullet { display:none; }
li.is-collapsed .list-bullet::after, .is-collapsed ~ .cm-formatting-list .list-bullet::after { background-color:var(--text-accent); box-shadow:0 0 0 4px var(--background-modifier-hover); }
.cm-fold-indicator:hover ~ .cm-formatting-list .list-bullet::after { background-color:var(--list-marker-color-hover); }

code { font-family:var(--font-monospace); overflow-wrap:anywhere; }
.ui-sample { font-family:var(--font-interface); }
`;
const sheet = `body{margin:0;color:var(--text-normal);background:var(--qp-desk)} main{max-width:900px;margin:28px auto;padding:30px;background:var(--qp-paper);border-radius:12px} .caption{font:13px Arial;color:var(--text-muted)} .columns{display:grid;grid-template-columns:1fr 1fr;gap:30px} h1,h2,h3,h4,h5,h6{margin:1em 0 .4em} .cm-line{min-height:1.6em} .live-list-2{padding-left:1.7em}.live-list-3{padding-left:3.4em} .callout-content p{margin-bottom:0} .offscreen{position:absolute;left:-5000px}`;
const bullet = id => `<span id="${id}" class="list-bullet"></span>`;
const headings = mode => [1,2,3,4,5,6].map(n => mode === 'r' ? `<h${n} id="r-h${n}">${n} 级标题 · Heading</h${n}>` : `<div id="l-h${n}" class="cm-line HyperMD-header HyperMD-header-${n}">${n} 级标题 · Heading</div>`).join('');
const lists = `<ul class="has-list-bullet"><li>${bullet('r-b1')}Theme release<ul class="has-list-bullet"><li>${bullet('r-b2')}主题文件<ul class="has-list-bullet"><li>${bullet('r-b3')}manifest.json</li></ul></li></ul></li><li class="task-list-item">${bullet('task-b')}<input id="task" type="checkbox">检查任务</li></ul><ol><li id="ordered">准备发布<ul class="has-list-bullet"><li>${bullet('mixed-b')}检查源码</li></ul></li></ol>`;
const liveLists = [1,2,3].map(n => `<div class="cm-line HyperMD-list-line HyperMD-list-line-${n} live-list-${n}"><span class="cm-fold-indicator" id="fold-${n}">›</span><span class="cm-formatting-list">${bullet('l-b'+n)}</span>${['Theme release','主题文件','manifest.json'][n-1]}</div>`).join('') + '<div class="cm-line HyperMD-list-line HyperMD-list-line-1"><span id="live-ordered" class="cm-formatting-list-ol">1.</span> 准备发布</div>';
const table = id => `<table><thead><tr><th id="${id}-th">内容</th><th>用途</th></tr></thead><tbody><tr id="${id}-odd"><td id="${id}-td"><div class="table-cell-wrapper" id="${id}-cell">theme.css</div></td><td>阅读样式</td></tr><tr id="${id}-even"><td>manifest.json</td><td>主题元数据</td></tr></tbody></table>`;
const callout = (type, mode) => `<div id="${mode}-${type}" class="callout" data-callout="${type}"><div class="callout-title">◇ ${type}</div><div class="callout-content"><p>这是提示正文，保留纸面感与清楚的边界。</p></div></div>`;
const types = ['note','info','tip','warning','danger','success','custom'];
const fixture = `<main><div class="caption">Quiet Paper · 静态排版对照（非 Obsidian 实机截图）</div><div class="columns"><section class="markdown-reading-view"><div class="markdown-rendered"><div class="caption">阅读视图</div>${headings('r')}<p id="reading-p">长文件路径：<code>C:\\Users\\Tom\\Documents\\Research\\Obsidian\\MyResearchVault\\.obsidian\\themes\\Quiet Paper\\theme.css</code></p>${lists}${table('r')}${types.slice(0,6).map(t=>callout(t,'r')).join('')}</div></section><section class="markdown-source-view mod-cm6 is-live-preview"><div class="caption">实时预览 · 静态结构</div><div class="cm-content">${headings('l')}<div id="live-p" class="cm-line">中文、English 与数字 2026 保持自然间距。</div>${liveLists}<div class="cm-table-widget markdown-rendered">${table('l')}</div>${types.slice(0,6).map(t=>callout(t,'l')).join('')}</div></section></div><div class="offscreen markdown-rendered">${callout('custom','r')}<ul id="fallback1"><li>一级<ul id="fallback2"><li>二级<ul id="fallback3"><li>三级</li></ul></li></ul></li></ul><div id="collapsed" class="callout is-collapsed"><div class="callout-title">提示</div><div id="collapsed-content" class="callout-content">折叠内容</div></div><span id="ui" class="ui-sample">界面</span><code id="mono">code</code><span id="muted" style="color:var(--text-muted)">次要文字</span></div></main>`;
const executablePath = process.env.QP_BROWSER_EXECUTABLE;
if (executablePath && /obsidian/i.test(executablePath)) throw new Error('Never launch Obsidian for this fixture.');
const browser = await chromium.launch({ headless:true, ...(executablePath ? {executablePath} : {channel:'msedge'}) });
const results = [];
try {
  const context = await browser.newContext({viewport:{width:1060,height:1100}});
  await context.route('**/*', route=>route.abort());
  const page = await context.newPage();
  const css = (id, prop, pseudo = null) => page.locator('#'+id).evaluate((el,{prop,pseudo})=>getComputedStyle(el,pseudo).getPropertyValue(prop),{prop,pseudo});
  const check = (label, ok) => { assert.ok(ok,label); results.push(label); };
  for (const palette of ['theme-light','theme-dark']) {
    await page.setContent(`<meta charset="utf-8"><style>${native}</style><style>${theme}</style><style>${sheet}</style><body class="${palette}">${fixture}</body>`);
    await page.evaluate(()=>document.fonts.ready);
    for (const id of ['reading-p','live-p']) check(`${palette}: ${id} default start`,await css(id,'text-align')==='start');
    await page.evaluate(()=>document.body.classList.add('qp-justify'));
    for (const id of ['reading-p','live-p']) check(`${palette}: ${id} opt-in justify`,await css(id,'text-align')==='justify');
    await page.emulateMedia({media:'print'});
    for (const id of ['reading-p','live-p']) check(`${palette}: ${id} print start`,await css(id,'text-align')==='start');
    await page.emulateMedia({media:'screen'});
    await page.evaluate(()=>document.body.classList.remove('qp-justify'));
    check(`${palette}: interface font retained`,await css('ui','font-family')==='Arial');
    check(`${palette}: code font retained`,await css('mono','font-family')==='monospace');
    // Replace the app's earlier stylesheet, not an inline style which always wins.
    for (const size of [16,24]) {
      await page.locator('style').first().evaluate((el,text)=>{el.textContent=text;},native.replace('--font-text-size:18px',`--font-text-size:${size}px`));
      for (const id of ['reading-p','live-p']) check(`${palette}: ${id} respects ${size}px`,parseFloat(await css(id,'font-size'))===size);
      check(`${palette}: paragraph rhythm scales ${size}px`,Math.abs(parseFloat(await css('reading-p','margin-top'))-size*.65)<.05);
      for (const mode of ['r','l']) check(`${palette}: ${mode} h1 scales ${size}px`,Math.abs(parseFloat(await css(mode+'-h1','font-size'))-size*1.65)<.05);
    }
    await page.locator('style').first().evaluate((el,text)=>{el.textContent=text;},native);
    for (const mode of ['r','l']) {
      for (const [level,weight] of [[4,'650'],[5,'600'],[6,'600']]) check(`${palette}: ${mode} h${level} weight`,await css(mode+'-h'+level,'font-weight')===weight);
      check(`${palette}: ${mode} h6 muted`,await css(mode+'-h6','color')===await css('muted','color'));
      const cell = mode==='r'?'r-td':'l-cell';
      const fs = parseFloat(await css(cell,'font-size'));
      check(`${palette}: ${mode} table breathing room`,Math.abs(parseFloat(await css(cell,'padding-top'))-fs*.45)<.05 && Math.abs(parseFloat(await css(cell,'padding-left'))-fs*.7)<.05);
      check(`${palette}: ${mode} no zebra rows`,await css(mode+'-odd','background-color')===await css(mode+'-even','background-color'));
      check(`${palette}: ${mode} header visible`,await css(mode+'-th','background-color')!=='rgba(0, 0, 0, 0)');
      for (const type of types.filter(t=>mode==='r'||t!=='custom')) {
        const id=mode+'-'+type;
        check(`${palette}: ${id} visible full-color callout`,await css(id,'background-color')!=='rgba(0, 0, 0, 0)' && await css(id,'border-left-width')==='4px' && await css(id,'mix-blend-mode')==='normal');
      }
    }
    check(`${palette}: live table native cell padding retained`,await css('l-td','padding-top')==='0px');
    check(`${palette}: semantic callouts distinct`,await css('r-note','background-color')!==await css('r-warning','background-color') && await css('r-warning','background-color')!==await css('r-danger','background-color'));
    for (const depth of [1,2,3]) {
      for (const prop of ['width','height','background-color','border-left-width','border-radius']) check(`${palette}: list depth ${depth} ${prop} parity`,await css('r-b'+depth,prop,'::after')===await css('l-b'+depth,prop,'::after'));
      const fill=await css('r-b'+depth,'background-color','::after');
      check(`${palette}: list depth ${depth} shape`,depth===2 ? fill==='rgba(0, 0, 0, 0)' && parseFloat(await css('r-b2','border-left-width','::after'))>0 : fill!=='rgba(0, 0, 0, 0)' && await css('r-b'+depth,'border-radius','::after')===(depth===1?'50%':'1px'));
    }
    await page.locator('#r-b1').evaluate(el=>el.parentElement.classList.add('is-collapsed'));
    await page.locator('#fold-1').evaluate(el=>el.classList.add('is-collapsed'));
    for (const mode of ['r','l']) check(`${palette}: ${mode} native collapsed feedback`,await css(mode+'-b1','box-shadow','::after')!=='none' && await css(mode+'-b1','background-color','::after')===await page.locator('body').evaluate(el=>{const p=document.createElement('span');p.style.color='var(--text-accent)';el.append(p);const c=getComputedStyle(p).color;p.remove();return c;}));
    await page.locator('#r-b1').evaluate(el=>el.parentElement.classList.remove('is-collapsed'));
    await page.locator('#fold-1').evaluate(el=>el.classList.remove('is-collapsed'));
    await page.locator('#fold-2').hover();
    check(`${palette}: native hover feedback`,await css('l-b2','background-color','::after')===await page.locator('body').evaluate(el=>getComputedStyle(el).color));
    await page.mouse.move(0,0);
    check(`${palette}: pseudo-element does not intercept clicks`,await css('l-b2','pointer-events','::after')==='none');
    check(`${palette}: top bullet enlarged`,parseFloat(await css('r-b1','width','::after'))>18*.39);
    check(`${palette}: mixed nested list hollow`,await css('mixed-b','background-color','::after')==='rgba(0, 0, 0, 0)');
    check(`${palette}: ordered markers match`,await css('ordered','color','::marker')===await css('live-ordered','color') && await css('ordered','font-weight','::marker')==='600');
    check(`${palette}: task checkbox preserved`,await css('task-b','display')==='none' && await css('task','display')!=='none');
    check(`${palette}: collapsed content preserved`,await css('collapsed-content','display')==='none');
    for (const [depth,type] of [[1,'disc'],[2,'circle'],[3,'square']]) check(`${palette}: fallback ${depth}`,await css('fallback'+depth,'list-style-type')===type);
    await page.screenshot({path:resolve(output,`typography-${palette}.png`),fullPage:true});
  }
} finally { await browser.close(); }
await writeFile(resolve(output,'typography-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(`${results.length} typography checks passed (static CSS fixtures).`);
