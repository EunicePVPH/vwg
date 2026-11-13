// Turns the single-file Vite build into the page fragment the Artifact tool publishes
// (the tool adds its own <!doctype>/<head>/<body> wrapper).
import { readFileSync, writeFileSync } from 'node:fs';

const html = readFileSync('dist-artifact/index.html', 'utf8');
const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || 'Transition Tracker';
const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
const scripts = [...html.matchAll(/<script type="module"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
if (!scripts.length) throw new Error('No inline module script found. Did the singlefile build run?');

const out = `<meta name="claude:viewport-fit-sides" content="cover">
<title>${title}</title>
<style>${styles}</style>
<div id="root"></div>
${scripts.map((s) => `<script type="module">${s}</script>`).join('\n')}
`;
writeFileSync('dist-artifact/artifact-page.html', out);
console.log(`artifact-page.html: ${(out.length / 1024).toFixed(0)} KB`);
