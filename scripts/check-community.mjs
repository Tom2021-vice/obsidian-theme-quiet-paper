import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import stylelint from 'stylelint';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const css=await readFile(resolve(root,'theme.css'),'utf8');
// Official rules plus the existing project naming/order exceptions.
// No compatibility, :has(), !important, or unknown-selector warning is disabled.
const result=await stylelint.lint({code:css,codeFilename:resolve(root,'theme.css'),configFile:resolve(root,'.stylelintrc.json')});
const warnings=result.results.flatMap(r=>r.warnings);
const counts={};
for(const w of warnings) counts[w.rule]=(counts[w.rule]??0)+1;
const fontBytes=[...css.matchAll(/data:font\/woff2;base64,[^"\s)]+/g)].reduce((n,m)=>n+Buffer.byteLength(m[0]),0);
const report={
  scope:'Local official CSS rules only; not a Community Directory scan or approval.',
  cssBytes:Buffer.byteLength(css),embeddedFontPayloadBytes:fontBytes,
  rules:counts,errors:warnings.filter(w=>w.severity==='error').length,
  warnings:warnings.filter(w=>w.severity==='warning').length,details:warnings,
};
await mkdir(resolve(root,'.local/review'),{recursive:true});
await writeFile(resolve(root,'.local/review/community-check.json'),JSON.stringify(report,null,2)+'\n');
console.log(`Official CSS rules with documented project exceptions: ${report.errors} errors, ${report.warnings} warnings.`);
console.table(counts);
console.log(`theme.css: ${report.cssBytes} bytes; embedded font payload: ${fontBytes} bytes.`);
console.log('Details: .local/review/community-check.json. Rationale: docs/COMMUNITY-REVIEW.md.');
if(result.errored)process.exitCode=1;
