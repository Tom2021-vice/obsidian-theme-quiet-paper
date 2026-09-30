import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import postcss from 'postcss';
import {chromium} from 'playwright-core';
import {compactCss} from '../scripts/compact-css.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const css=await readFile(resolve(root,'theme.css'),'utf8');
const {version}=JSON.parse(await readFile(resolve(root,'manifest.json'),'utf8'));
const files=(await readdir(resolve(root,'src'))).filter(f=>f.endsWith('.css')).sort();
const source=(await Promise.all(files.map(f=>readFile(resolve(root,'src',f),'utf8')))).join('\n');
const parsed=postcss.parse(css);
const checks=[];
const check=(name,fn)=>{fn();checks.push(name);};
const semantics = node => ({type:node.type,...Object.fromEntries(['selector','name','params','prop','value','important'].filter(k=>node[k]!==undefined).map(k=>[k,node[k]])),...(node.nodes?{nodes:node.nodes.filter(n=>n.type!=='comment').map(semantics)}:{})});
const nonFonts=parsed.clone();
nonFonts.walkAtRules('font-face',n=>n.remove());
check('generated CSS preserves the complete ordered source AST',()=>assert.deepEqual(semantics(nonFonts),semantics(postcss.parse(source))));
check('compaction preserves selectors, strings, data URLs and calc spacing',()=>{
 const sample='/* test */\n@media print {\n.foo:has(> .bar) { --custom: calc(100% - 2em); content: "a  b"; width: auto !important; }\n}';
 assert.deepEqual(semantics(postcss.parse(compactCss(sample))),semantics(postcss.parse(sample)));
});
check('Style Settings metadata is unchanged',()=>{
 const settings=r=>{let text;r.walkComments(n=>{if(n.text.startsWith('@settings'))text=n.text});return text;};
 assert.ok(settings(parsed));assert.equal(settings(parsed),settings(postcss.parse(source)));
});
check('license and version header survives',()=>assert.ok(css.startsWith(`/* Quiet Paper ${version} | MIT (theme) | TeX Gyre fonts: GUST Font License.`)));
const faces=[];parsed.walkAtRules('font-face',n=>faces.push(n));
check('all four font faces remain',()=>assert.equal(faces.length,4));
for(const [i,face] of ['regular','italic','bold','bolditalic'].entries()){
 const declarations=Object.fromEntries(faces[i].nodes.filter(n=>n.type==='decl').map(n=>[n.prop,n.value]));
 const original=await readFile(resolve(root,`assets/fonts/texgyrepagella-${face}.woff2`));
 check(`${face} font payload remains byte-identical`,()=>assert.deepEqual(Buffer.from(declarations.src.match(/base64,([^"\)]+)/)[1],'base64'),original));
}
for(const name of ['README.md','README.zh-CN.md']){
 const readme=await readFile(resolve(root,name),'utf8');
 check(`${name} version and language link`,()=>{assert.ok(readme.includes(version));assert.ok(readme.includes(name==='README.md'?'README.zh-CN.md':'[English](README.md)'));});
}
const english=await readFile(resolve(root,'README.md'),'utf8');
check('English landing page has install and font instructions',()=>assert.ok(english.includes('## Installation')&&english.includes('## Fonts')));

const fonts=faces.map(n=>n.toString()).join('\n');
const native=`body{--font-text-size:18px;--font-text:var(--font-text-theme);color:var(--text-normal)}.markdown-rendered,.cm-content{font:var(--font-text-size)/var(--line-height-normal) var(--font-text)}p{margin-block:var(--p-spacing)}.cm-line{position:relative}.HyperMD-quote{background:var(--blockquote-background-color)}mjx-container{display:block}a{color:var(--text-accent);text-decoration-line:underline}`;
const math=(id,renderer,display='true')=>`<mjx-container id="${id}" class="MathJax" jax="${renderer}" display="${display}"><span>x² + y² = 1</span></mjx-container>`;
const fixture=`<div class="markdown-reading-view"><div class="markdown-rendered"><p id="paragraph">中文 English 2026</p><a id="link" href="#">An underlined link</a><blockquote id="quote"><p>保持现有引用排版。</p></blockquote><div class="math-block">${math('reading-math','CHTML')}</div>${math('inline-math','SVG','false')}</div></div><div class="markdown-source-view mod-cm6 is-live-preview"><div class="cm-editor"><div class="cm-scroller"><div class="cm-sizer"><div class="cm-contentContainer"><div class="cm-content"><div id="live-paragraph" class="cm-line">中文 English 2026</div><div id="live-blank" class="cm-line"><br></div><div id="live-quote" class="cm-line HyperMD-quote">保持现有引用排版。</div><div class="math-block">${math('live-math','SVG')}</div></div></div></div></div></div></div>`;
const executablePath=process.env.QP_BROWSER_EXECUTABLE;
if(executablePath&&/obsidian/i.test(executablePath))throw Error('Never launch Obsidian for fixtures.');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{channel:'msedge'})});
try{
 const context=await browser.newContext({viewport:{width:1050,height:900}});
 await context.route('**/*',r=>r.abort());
 const page=await context.newPage();
 const snapshot=async sheet=>{
  await page.setContent(`<style>${native}</style><style>${sheet}</style><body class="theme-light">${fixture}</body>`);
  await page.evaluate(()=>document.fonts.ready);
  return page.locator('[id]').evaluateAll(elements=>Object.fromEntries(elements.map(el=>{
   const s=getComputedStyle(el),r=el.getBoundingClientRect();
   return[el.id,{styles:Object.fromEntries(Array.from(s).filter(k=>!k.startsWith('--')).map(k=>[k,s.getPropertyValue(k)])),rect:[r.x,r.y,r.width,r.height]}];
  })));
 };
 const compiled=await snapshot(css),authoring=await snapshot(fonts+source);
 check('source and compact CSS have identical computed styles and geometry',()=>assert.deepEqual(compiled,authoring));
 check('reading MathJax display spacing',()=>assert.ok(Math.abs(parseFloat(compiled['reading-math'].styles['margin-top'])-9.9)<.02));
 check('Live Preview MathJax matches reading spacing',()=>assert.equal(compiled['reading-math'].styles['margin-top'],compiled['live-math'].styles['margin-top']));
 check('inline math does not receive display margins',()=>assert.equal(compiled['inline-math'].styles['margin-top'],'0px'));
 check('default indent and underline skip remain intact',()=>{assert.equal(compiled.paragraph.styles['text-indent'],'0px');assert.equal(compiled.link.styles['text-decoration-skip-ink'],'auto');});
 const baselineIndex=process.argv.indexOf('--baseline');
 if(baselineIndex>=0){
  const before=await snapshot(await readFile(resolve(root,process.argv[baselineIndex+1]),'utf8'));
  check('previous theme styles and geometry are unchanged in both views',()=>assert.deepEqual(compiled,before));
 }
}finally{await browser.close()}
console.log(`${checks.length} build and compatibility checks passed.`);
