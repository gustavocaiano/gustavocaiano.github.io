// Rasterises the name in Inter ExtraBold to a raw 8-bit mask for `render-valley.mjs name`.
import { chromium } from 'playwright';
import fs from 'node:fs';
const [out] = process.argv.slice(2);
const W = 2400, H = 560;
const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(`<link href="https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap" rel="stylesheet"><canvas id="c" width="${W}" height="${H}"></canvas>`);
await p.evaluate(() => document.fonts.load('800 300px Inter'));
const b64 = await p.evaluate(([W, H]) => {
    const c = document.getElementById('c').getContext('2d');
    c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '800 268px Inter';
    try { c.letterSpacing = '6px'; } catch (_) {}
    c.fillText('Gustavo Caiano', W / 2, H / 2 + 8);
    const d = c.getImageData(0, 0, W, H).data, m = new Uint8Array(W * H);
    for (let i = 0; i < m.length; i++) m[i] = d[i * 4];
    let s = ''; for (let i = 0; i < m.length; i += 32768) s += String.fromCharCode.apply(null, m.subarray(i, i + 32768));
    return btoa(s);
}, [W, H]);
fs.writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('font ok', await p.evaluate(() => document.fonts.check('800 40px Inter')), 'bytes', Buffer.from(b64, 'base64').length);
await b.close();
