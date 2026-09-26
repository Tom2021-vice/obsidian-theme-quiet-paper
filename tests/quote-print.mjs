/* Static CodeMirror/reading fixtures and representative Mermaid SVG output.
   No Obsidian process, vault, or Mermaid renderer is started. */
import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright-core';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const theme=await readFile(resolve(root,'theme.css'),'utf8');
const output=resolve(root,'.local/review');
await mkdir(output,{recursive:true});
const native=`
*{box-sizing:border-box} body{--font-text-size:18px;--font-text:var(--font-text-theme);margin:0;color:var(--text-normal);background:var(--qp-paper)}
.markdown-rendered,.cm-content{font:var(--font-text-size)/var(--line-height-normal) var(--font-text)}
.markdown-rendered p{margin-block:var(--p-spacing)}
.markdown-rendered blockquote{color:var(--blockquote-color);background:var(--blockquote-background-color);border-inline-start:var(--blockquote-border-thickness) solid var(--blockquote-border-color);margin:1em 0;padding-block:0}
.markdown-rendered blockquote>:first-child{margin-top:0}.markdown-rendered blockquote>:last-child{margin-bottom:0}
.markdown-source-view.mod-cm6 .cm-content>*{margin:0!important;display:block}
.cm-line{position:relative}
.markdown-source-view.mod-cm6.is-live-preview .HyperMD-quote{background:var(--blockquote-background-color);color:var(--blockquote-color);padding-inline:1em}
.HyperMD-quote::before{content:'';position:absolute;inset:0 auto 0 0;border-left:var(--blockquote-border-thickness) solid var(--blockquote-border-color);pointer-events:none}
.markdown-source-view.mod-cm6 .cm-embed-block>.mermaid{overflow-x:auto}
.mermaid-wrapper{display:flex;flex-direction:column}
svg{overflow:hidden}
`;
const editor = content => `<div class="markdown-source-view mod-cm6 is-live-preview"><div class="cm-editor"><div class="cm-scroller"><div class="cm-sizer"><div class="cm-contentContainer"><div class="cm-content">${content}</div></div></div></div></div></div>`;
const text='关键服务不自动升级；删除前先确认；重大操作先保留回滚点。';
const quotes=`<main style="padding:28px;width:850px"><div class="markdown-rendered"><blockquote id="reading"><p>${text}</p></blockquote><blockquote id="reading-multi"><p>第一段引用，观察顶部。</p><p>第二段引用，观察底部。</p></blockquote></div>${editor(`<div id="live" class="cm-line HyperMD-quote">${text}</div><div class="cm-line"><br></div><div id="first" class="cm-line HyperMD-quote">连续引用，第一行。</div><div id="middle" class="cm-line HyperMD-quote">连续引用，中间行。</div><div id="last" class="cm-line HyperMD-quote">连续引用，最后一行。</div><div class="cm-line"><br></div><div class="cm-table-widget"><div class="cm-content"><div id="nested" class="cm-line HyperMD-quote">单元格中的编辑器</div></div></div>`)}</main>`;
const svg = (id,width,height,style='',vertical=false) => {
 const count=id==='small'?2:6; const labelSize=id==='small'?14:24;
 const nodes=Array.from({length:count},(_,i)=>{
  const x=vertical?10:10+i*(width-20)/count, y=vertical?10+i*(height-20)/count:10;
  const w=vertical?width-20:(width-20)/count-(id==='small'?10:30), h=vertical?(height-20)/count-30:height-20;
  const label=i===0?`${id}-START`:i===count-1?`${id}-END`:`Step ${i+1}`;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eeebfc" stroke="#8870dd"/><foreignObject x="${x}" y="${y+h/2-18}" width="${w}" height="40"><div xmlns="http://www.w3.org/1999/xhtml" style="font:${labelSize}px Arial;text-align:center;color:#24231f">${label}</div></foreignObject></g>`;
 }).join('');
 return `<div class="mermaid" id="${id}-container"><svg id="${id}" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="${style}">${nodes}<svg id="${id}-icon" x="12" y="12" width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="#8870dd"/></svg></svg></div>`;
};
const graphs=`<div class="print"><main class="markdown-preview-view markdown-rendered"><h2>Mermaid print fixture - not an Obsidian export</h2><p>Fixed screen dimensions: all six nodes must fit on the page.</p><div class="mermaid-wrapper">${svg('wide',2400,180,'width:2400px;height:180px;min-width:2400px;max-width:2400px')}</div><p>Percentage width SVG with an intrinsic viewBox.</p>${svg('responsive',1500,180,'width:100%;height:auto;max-width:1500px')}<p>Small charts retain their natural size.</p>${svg('small',240,120)}<div class="tall-section"><h2>Vertical diagram</h2>${svg('tall',300,2400,'width:300px;height:2400px',true)}</div><svg id="unrelated" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5"/></svg></main></div>`;
const printSheet=`main{width:100%;padding:0}h2{font:22px Arial;margin:0 0 12px}p{font:15px Arial;margin:12px 0}.tall-section{break-before:page} @media screen{.print{width:680px;margin:24px auto}}`;
const executablePath=process.env.QP_BROWSER_EXECUTABLE;
if(executablePath&&/obsidian/i.test(executablePath))throw Error('Never launch Obsidian for fixtures.');
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{channel:'msedge'})});
const results=[];
try{
 const context=await browser.newContext({viewport:{width:920,height:1100}});
 await context.route('**/*',route=>route.abort());
 const page=await context.newPage();
 const check=(name,ok)=>{assert.ok(ok,name);results.push(name)};
 const measure=id=>page.locator('#'+id).evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect();return{top:parseFloat(s.paddingTop),bottom:parseFloat(s.paddingBottom),height:r.height,width:r.width,display:s.display,transform:s.transform,overflow:s.overflow,pointer:s.pointerEvents};});
 for(const palette of ['theme-light','theme-dark']){
  await page.setContent(`<style>${native}</style><style>${theme}</style><body class="${palette}">${quotes}</body>`);
  await page.evaluate(()=>document.fonts.ready);
  for(const size of [16,24,32]){
   await page.evaluate(size=>document.body.style.setProperty('--font-text-size',size+'px'),size);
   for(const id of ['reading','reading-multi','live']){
    const m=await measure(id);
    check(`${palette}/${size}/${id}: total padding preserved`,Math.abs(m.top+m.bottom-size*1.2)<.1);
    check(`${palette}/${size}/${id}: optical offset scales`,Math.abs(m.top-m.bottom-size*.4)<.1);
    check(`${palette}/${size}/${id}: no transform`,m.transform==='none');
    await page.evaluate(()=>document.body.style.setProperty('--qp-quote-optical-offset','0em'));
    check(`${palette}/${size}/${id}: block height unchanged`,Math.abs((await measure(id)).height-m.height)<.1);
    await page.evaluate(()=>document.body.style.removeProperty('--qp-quote-optical-offset'));
   }
   check(`${palette}/${size}: multiline outer padding matches`,Math.abs((await measure('first')).top+(await measure('last')).bottom-size*1.2)<.1);
   check(`${palette}/${size}: middle line stays balanced`,Math.abs((await measure('middle')).top-(await measure('middle')).bottom)<.1);
   check(`${palette}/${size}: nested editor untouched`,(await measure('nested')).top===0&&(await measure('nested')).bottom===0);
  }
  await page.locator('#live').screenshot({path:resolve(output,`quote-after-${palette}.png`)});
  await page.evaluate(()=>document.body.style.setProperty('--qp-quote-optical-offset','0em'));
  await page.locator('#live').screenshot({path:resolve(output,`quote-before-${palette}.png`)});
 }
 await page.setContent(`<style>${native}</style><style>${theme}</style><style>${printSheet}</style><body class="theme-light">${graphs}</body>`);
 await page.evaluate(()=>document.fonts.ready);
 check('screen: wide SVG dimensions unchanged',(await measure('wide')).width===2400&&(await measure('wide')).height===180);
 const nestedWidth = await page.locator('#wide-icon').evaluate(el=>getComputedStyle(el).width);
 await page.emulateMedia({media:'print'});
 for(const width of [500,680,960]){
  await page.setViewportSize({width,height:900});
  for(const id of ['wide','responsive','small','tall']){
   const m=await measure(id),container=await measure(id+'-container');
   check(`print/${width}/${id}: within column`,m.width<=container.width+.5);
   check(`print/${width}/${id}: within height cap`,m.height<=720.5);
   const ratio=id==='wide'?2400/180:id==='responsive'?1500/180:id==='small'?2:300/2400;
   check(`print/${width}/${id}: aspect ratio retained`,Math.abs(m.width/m.height-ratio)<.03);
   check(`print/${width}/${id}: overflow is not hidden by container`,container.overflow==='visible');
  }
  check(`print/${width}: small diagram not enlarged`,(await measure('small')).width===240);
  check(`print/${width}: unrelated SVG untouched`,(await measure('unrelated')).width===20);
  check(`print/${width}: nested SVG sizing untouched`,await page.locator('#wide-icon').evaluate(el=>getComputedStyle(el).width)===nestedWidth);
 }
 if(process.argv.includes('--pdf')){
  for(const [name,format,landscape] of [['a4','A4',false],['letter','Letter',false],['landscape','A4',true]]){
   await page.pdf({path:resolve(output,`mermaid-print-${name}.pdf`),format,landscape,printBackground:true,margin:{top:'15mm',bottom:'15mm',left:'15mm',right:'15mm'}});
  }
 }
}finally{await browser.close()}
await writeFile(resolve(output,'quote-print-results.json'),JSON.stringify(results,null,2)+'\n');
console.log(`${results.length} quote/print checks passed (static fixtures).`);
