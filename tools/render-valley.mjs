// Renders the homepage background (img/valley.jpg): a Mont Blanc-like massif seen across
// a meadow plain with a small lake, a log cabin and a road. Everything is ray-traced from a
// procedural, water-eroded terrain, so the lake really reflects the mountains and the cabin.
//   node tools/render-valley.mjs build <cacheDir> [droplets]  generate + erode the terrain
//   node tools/render-valley.mjs maps <cacheDir>              redo plain, lake and trees (skips erosion)
//   node tools/render-valley.mjs render <cacheDir> <w> <h>    ray-trace to <cacheDir>/valley.png
//   node tools/render-valley.mjs name <cacheDir>              the cloud lettering, from <cacheDir>/name-mask.u8 (2400x560)
//   node tools/render-valley.mjs wood <cacheDir>              the wood textures of the panels
//   node tools/render-valley.mjs lake <cacheDir>              the mask of the moving water, to <cacheDir>/lake-mask.png
//   node tools/render-valley.mjs points <cacheDir>            screen positions (1600x900) of the props
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const N = 3072;            // heightmap resolution
const S = 30000;           // world size in metres
const CELL = S / N;

const PLAIN = 1300, LAKE = PLAIN - 1.4;
const CAM = { x: 14600, z: 2000, eye: 46, yaw: 0, pitch: 0.09, fov: 0.98 };
const SUN = norm([-0.6, 0.6, -0.46]);
const LAKE_C = [CAM.x + 560, CAM.z + 490], LAKE_R = [640, 240];
const HOUSE = { x: CAM.x + 34, z: CAM.z + 678, yaw: 0.22, k: 1.3 };
const POST = { x: CAM.x - 24.5, z: CAM.z + 262, k: 2 };

const ROAD = catmull([[-10, -140], [-10, 60], [-13, 170], [-30, 262], [-104, 385], [-152, 500], [-140, 590], [-70, 682], [20, 712], [110, 800], [70, 1000], [-60, 1300], [-170, 1800], [-40, 2500], [160, 3400]]
    .map(([x, z]) => [CAM.x + x, CAM.z + z]), 14);

const lakeS = (x, z) => Math.hypot((x - LAKE_C[0]) / LAKE_R[0], (z - LAKE_C[1]) / LAKE_R[1]) + (fbm(x / 110, z / 70, 3) - 0.5) * 0.2;

function norm(v) { const l = Math.hypot(...v); return v.map(c => c / l); }
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function catmull(p, sub) {
    const out = [];
    for (let i = 0; i < p.length - 1; i++) {
        const a = p[Math.max(0, i - 1)], b = p[i], c = p[i + 1], d = p[Math.min(p.length - 1, i + 2)];
        for (let k = 0; k < sub; k++) {
            const t = k / sub, q = (j) => 0.5 * (2 * b[j] + (c[j] - a[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * t * t * t);
            out.push([q(0), q(1)]);
        }
    }
    out.push(p[p.length - 1]);
    return out;
}
function roadDist(x, z) {
    if (z > CAM.z + 3600 || x < CAM.x - 320 || x > CAM.x + 320) return 1e9;
    let best = 1e18;
    for (let i = 0; i < ROAD.length - 1; i++) {
        const [ax, az] = ROAD[i], [bx, bz] = ROAD[i + 1];
        const dx = bx - ax, dz = bz - az;
        const u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz));
        const ex = x - ax - dx * u, ez = z - az - dz * u, d = ex * ex + ez * ez;
        if (d < best) best = d;
    }
    return Math.sqrt(best);
}

/* ---------- noise ---------- */
const PERM = new Uint8Array(512);
{
    let s = 1234567;
    const r = () => (s = (s * 48271) % 2147483647) / 2147483647;
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}
const GRAD = new Float32Array(256);
for (let i = 0; i < 256; i++) GRAD[i] = (PERM[i] * 0.61803398875) % 1;
const hash2 = (i, j) => GRAD[PERM[(PERM[i & 255] + (j & 255)) & 511]];

function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const X = xi & 255, Y = yi & 255;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10);
    const a = GRAD[PERM[(PERM[X] + Y) & 511]], b = GRAD[PERM[(PERM[(X + 1) & 255] + Y) & 511]];
    const c = GRAD[PERM[(PERM[X] + Y + 1) & 511]], d = GRAD[PERM[(PERM[(X + 1) & 255] + Y + 1) & 511]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function n3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const fx = x - xi, fy = y - yi, fz = z - zi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const h = (a, b, c) => GRAD[PERM[(PERM[(PERM[a & 255] + b) & 511] + c) & 511]];
    const l0 = mix(mix(h(X, Y, Z), h(X + 1, Y, Z), u), mix(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v);
    const l1 = mix(mix(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), mix(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v);
    return mix(l0, l1, w);
}
function fbm(x, y, oct) {
    let a = 0.5, s = 0;
    for (let i = 0; i < oct; i++) { s += a * n2(x, y); x = x * 2.03 + 17.1; y = y * 2.03 + 9.2; a *= 0.5; }
    return s;
}
function ridged(x, y, oct) {
    let a = 0.5, s = 0, w = 1;
    for (let i = 0; i < oct; i++) {
        let v = 1 - Math.abs(2 * n2(x, y) - 1);
        v *= v;
        s += v * a * w;
        w = clamp(v * 1.9);
        x = x * 2.07 + 31.4; y = y * 2.07 + 11.7; a *= 0.52;
    }
    return s;
}

/* ---------- terrain ---------- */
//  [cx, cz, sx, sz, amplitude, rotation]
const MASSES = [
    [12300, 14700, 3000, 2500, 2850, -0.1],    // the dome
    [7600, 14900, 3400, 2400, 2350, 0.05],     // long snowy shoulder to the west
    [2800, 14700, 2900, 2500, 2150, 0.1],
    [18600, 14100, 4200, 2000, 2150, -0.08],   // the needles
    [25500, 15000, 3400, 2400, 2100, 0.2],
    [15000, 26000, 11000, 2200, 2100, 0],      // ranges behind
    [28300, 20000, 2000, 6500, 2100, 0],
    [1400, 6200, 2500, 3900, 1300, 0.2],       // wooded valley walls, well away from us
    [28000, 7000, 2500, 4500, 1550, 0.12]
];

function macro(x, z) {
    let h = 1180;
    for (const [cx, cz, sx, sz, amp, rot] of MASSES) {
        const c = Math.cos(rot), s = Math.sin(rot), dx = x - cx, dz = z - cz;
        const u = (dx * c - dz * s) / sx, v = (dx * s + dz * c) / sz;
        h += amp * Math.exp(-(u * u + v * v));
    }
    return h;
}

function buildHeight() {
    const H = new Float32Array(N * N);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = i * CELL, z = j * CELL;
        const wx = x + 1500 * (fbm(x / 5200, z / 5200, 4) - 0.5), wz = z + 1500 * (fbm(x / 5200 + 40, z / 5200 + 11, 4) - 0.5);
        const m = macro(wx, wz);
        const rough = sstep(1600, 2700, m);
        const dome = Math.exp(-(((x - 12300) / 2500) ** 2 + ((z - 14800) / 2000) ** 2));
        const needles = sstep(15000, 16400, x) * (1 - sstep(22000, 24000, x)) * Math.exp(-(((z - 14000) / 1800) ** 2));
        const r = ridged(wx / 2700, wz / 2700, 9) - 0.42;
        const soft = fbm(x / 1500, z / 1500, 6) - 0.5;
        const spur = ridged(wx / 1700 + 9, wz / 2500 + 4, 6) - 0.42;
        const ribs = sstep(1250, 1800, m) * (1 - rough * 0.55);
        const spires = Math.pow(ridged(wx / 760 + 5, wz / 1100 + 2, 8), 1.7) * 900 * needles * rough;
        H[j * N + i] = m + r * (120 + 1500 * rough) * (0.25 + 0.75 * rough) * (1 - 0.72 * dome)
            + soft * (520 - 260 * rough) * (1 - 0.6 * dome) + spur * 760 * ribs + spires;
    }
    return H;
}

function erode(H, drops) {
    const scale = 4000, flow = new Float32Array(N * N);
    for (let i = 0; i < H.length; i++) H[i] /= scale;
    const radius = 4, brush = [];
    let total = 0;
    for (let y = -radius; y <= radius; y++) for (let x = -radius; x <= radius; x++) {
        const w = 1 - Math.hypot(x, y) / radius;
        if (w > 0) { brush.push([x, y, w]); total += w; }
    }
    brush.forEach(b => { b[2] /= total; });
    const sample = (x, y) => {
        const i = x | 0, j = y | 0, u = x - i, v = y - j, k = j * N + i;
        const a = H[k], b = H[k + 1], c = H[k + N], d = H[k + N + 1];
        return [a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v,
            (b - a) * (1 - v) + (d - c) * v, (c - a) * (1 - u) + (d - b) * u];
    };
    let seed = 987654;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let n = 0; n < drops; n++) {
        let x = rnd() * (N - 2), y = rnd() * (N - 2), dx = 0, dy = 0, speed = 1, water = 1, sed = 0;
        for (let life = 0; life < 60; life++) {
            const ci = x | 0, cj = y | 0, u = x - ci, v = y - cj;
            const [h, gx, gy] = sample(x, y);
            dx = dx * 0.05 - gx * 0.95; dy = dy * 0.05 - gy * 0.95;
            const len = Math.hypot(dx, dy);
            if (len < 1e-9) break;
            dx /= len; dy /= len;
            x += dx; y += dy;
            if (x < 5 || y < 5 || x >= N - 6 || y >= N - 6) break;
            flow[cj * N + ci] += water;
            const nh = sample(x, y)[0], dh = nh - h;
            const cap = Math.max(-dh * speed * water * 5, 0.0002);
            if (sed > cap || dh > 0) {
                const amt = dh > 0 ? Math.min(dh, sed) : (sed - cap) * 0.3;
                sed -= amt;
                const k = cj * N + ci;
                H[k] += amt * (1 - u) * (1 - v); H[k + 1] += amt * u * (1 - v);
                H[k + N] += amt * (1 - u) * v; H[k + N + 1] += amt * u * v;
            } else {
                const amt = Math.min((cap - sed) * 0.3, -dh);
                for (const [ox, oy, w] of brush) {
                    const k = (cj + oy) * N + ci + ox;
                    if (k < 0 || k >= H.length) continue;
                    const e = Math.min(H[k], amt * w);
                    H[k] -= e; sed += e;
                }
            }
            speed = Math.sqrt(Math.max(0, speed * speed + dh * 4));
            water *= 0.985;
        }
    }
    for (let i = 0; i < H.length; i++) H[i] *= scale;
    return flow;
}

const plainMask = (x, z) => 1 - sstep(1, 1.8, Math.hypot((x - CAM.x) / 3600, (z - (CAM.z + 900)) / 3000));

/** Rockfall: anything steeper than the talus angle slides down. Removes one-cell spikes. */
function weather(H, passes = 40) {
    const talus = CELL * 1.45;
    for (let n = 0; n < passes; n++) {
        for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
            const k = j * N + i, h = H[k];
            if (h < 2000) continue;
            let low = k, drop = 0;
            for (const o of [k - 1, k + 1, k - N, k + N]) { const d = h - H[o]; if (d > drop) { drop = d; low = o; } }
            if (drop > talus) { const m = (drop - talus) * 0.5; H[k] -= m; H[low] += m; }
        }
    }
}

/** Flatten the plain around us and dig the lake. Runs after erosion. */
function shapePlain(H) {
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = i * CELL, z = j * CELL, k = j * N + i;
        const m = plainMask(x, z);
        if (m <= 0) continue;
        const swell = (fbm(x / 620, z / 620, 4) - 0.5) * 26 * sstep(1.1, 2.2, lakeS(x, z));
        const s = lakeS(x, z);
        // low hummocks, levelled where the shore, the props and the camera stand
        const rough = ((fbm(x / 150 + 4, z / 150 + 8, 4) - 0.5) * 16 + (fbm(x / 55 + 2, z / 55, 3) - 0.5) * 5)
            * sstep(1.08, 1.35, s) * sstep(16, 50, Math.hypot(x - HOUSE.x, z - HOUSE.z))
            * sstep(5, 18, Math.hypot(x - POST.x, z - POST.z)) * sstep(30, 90, Math.hypot(x - CAM.x, z - CAM.z));
        H[k] = mix(H[k], PLAIN + swell + rough, m);
        if (s < 1.5) H[k] = mix(LAKE - 5, H[k], sstep(0.86, 1.12, s));
        if (s > 1.12 && s < 3) H[k] = Math.max(H[k], LAKE + 0.7);      // no second shoreline
    }
}

/** Where trees grow, 0..1. */
function buildForest(H) {
    const F = new Float32Array(N * N);
    const copses = [[-185, 760, 62], [-40, 830, 44], [120, 905, 70], [300, 760, 52], [440, 640, 60], [-420, 610, 70], [-330, 960, 110], [70, 1300, 150], [-620, 1200, 190], [760, 1050, 210], [420, 1500, 170]];
    for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
        const x = i * CELL, z = j * CELL, k = j * N + i, y = H[k];
        if (y < LAKE + 1) continue;
        const big = fbm(x / 900, z / 900, 5), mid = fbm(x / 130, z / 130, 4);
        const gx = (H[k + 1] - H[k - 1]) / (2 * CELL), gz = (H[k + N] - H[k - N]) / (2 * CELL);
        const slope = 1 - 1 / Math.hypot(gx, gz, 1);
        const treeline = 2030 + (big - 0.5) * 560;
        let t = (1 - sstep(treeline - 70, treeline + 60, y)) * (1 - plainMask(x, z)) * sstep(0.2, 0.34, big + (mid - 0.5) * 0.4 + 0.12) * (1 - sstep(0.5, 0.72, slope));
        const edge = (fbm(x / 60, z / 60, 3) - 0.5) * 0.7;
        for (const [dx, dz, r] of copses) {
            const d = Math.hypot(x - CAM.x - dx, z - CAM.z - dz) / r + edge;
            if (d < 1.05) t = Math.max(t, 1 - sstep(0.8, 1.05, d));
        }
        const lone = sstep(0.54, 0.6, fbm(x / 170, z / 170, 3)) * 0.3 * plainMask(x, z) * sstep(1.1, 1.4, lakeS(x, z));
        t = Math.max(t, lone);
        if (t > 0) t *= sstep(9, 16, roadDist(x, z)) * sstep(16, 30, Math.hypot(x - HOUSE.x, z - HOUSE.z));
        F[k] = t;
    }
    return F;
}

/** Log of the eroding water's path, blurred: glaciers follow it. */
function blurFlow(flow) {
    let a = Float32Array.from(flow, v => Math.log1p(v));
    const r = 7, w = 2 * r + 1;
    for (let pass = 0; pass < 2; pass++) {
        const b = new Float32Array(N * N);
        for (let j = 0; j < N; j++) { let s = 0; for (let i = -r; i <= r; i++) s += a[j * N + clamp(i, 0, N - 1)]; for (let i = 0; i < N; i++) { b[j * N + i] = s / w; s += a[j * N + Math.min(N - 1, i + r + 1)] - a[j * N + Math.max(0, i - r)]; } }
        const c = new Float32Array(N * N);
        for (let i = 0; i < N; i++) { let s = 0; for (let j = -r; j <= r; j++) s += b[clamp(j, 0, N - 1) * N + i]; for (let j = 0; j < N; j++) { c[j * N + i] = s / w; s += b[Math.min(N - 1, j + r + 1) * N + i] - b[Math.max(0, j - r) * N + i]; } }
        a = c;
    }
    return a;
}

/* ---------- props: unions of convex solids ---------- */
const WOOD = 0, ROOF = 1, STONE = 2, BOARD = 3, TIMBER = 4;

function buildProps() {
    const solids = [];
    // a solid given in the prop's own frame (ax = right, ay = up, az = forward)
    const frame = (ox, oy, oz, yaw, k) => {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        return { o: [ox, oy, oz], k, ax: [c, 0, -s], ay: [0, 1, 0], az: [s, 0, c] };
    };
    const toWorld = (f, v) => [0, 1, 2].map(i => f.o[i] + f.k * (f.ax[i] * v[0] + f.ay[i] * v[1] + f.az[i] * v[2]));
    const toDir = (f, v) => norm([0, 1, 2].map(i => f.ax[i] * v[0] + f.ay[i] * v[1] + f.az[i] * v[2]));
    const solid = (f, planes, mat, group) => solids.push({
        mat, group, f,
        planes: planes.map(([n, p]) => { const w = toDir(f, norm(n)); return { n: w, d: dot(w, toWorld(f, p)) }; })
    });
    const box = (f, x0, x1, y0, y1, z0, z1, mat, group) => solid(f, [
        [[1, 0, 0], [x1, 0, 0]], [[-1, 0, 0], [x0, 0, 0]], [[0, 1, 0], [0, y1, 0]], [[0, -1, 0], [0, y0, 0]], [[0, 0, 1], [0, 0, z1]], [[0, 0, -1], [0, 0, z0]]
    ], mat, group);

    // cabin: long log walls, a gabled upper storey and a shingle roof with deep eaves
    const hf = frame(HOUSE.x, PLAIN - 0.4, HOUSE.z, HOUSE.yaw, HOUSE.k);
    const W = 6.4, D = 4.6, E = 3.6, R = 7.4;
    box(hf, -W, W, 0, 0.7, -D, D, STONE, 0);
    box(hf, -W + 0.08, W - 0.08, 0.7, E, -D + 0.08, D - 0.08, WOOD, 0);
    solid(hf, [[[1, 0, 0], [W, 0, 0]], [[-1, 0, 0], [-W, 0, 0]], [[0, -1, 0], [0, E, 0]], [[0, D, -(R - E)], [0, E, -D]], [[0, D, R - E], [0, E, D]]], WOOD, 0);
    const over = 1.1, t = 0.3, lift = t * Math.hypot(D, R - E) / D;
    for (const side of [-1, 1]) {
        solid(hf, [
            [[1, 0, 0], [W + 0.9, 0, 0]], [[-1, 0, 0], [-W - 0.9, 0, 0]],
            [[0, D, side * (R - E)], [0, R + lift, 0]], [[0, -D, -side * (R - E)], [0, R, 0]],
            [[0, 0, side], [0, 0, side * (D + over)]], [[0, 0, -side], [0, 0, 0]]
        ], ROOF, 0);
    }
    box(hf, 2.6, 3.8, 3, 9.1, 0.5, 1.7, STONE, 0);       // chimney
    box(hf, 2.45, 3.95, 9.1, 9.3, 0.35, 1.85, STONE, 0);

    // signpost: a post with one arrow board per project
    const pf = frame(POST.x, PLAIN - 0.1, POST.z, 0.1, POST.k);
    box(pf, -0.13, 0.13, 0, 5.2, -0.13, 0.13, TIMBER, 1);
    for (let i = 0; i < 4; i++) {
        const y = 4.75 - i * 0.95, dir = i % 2 ? -1 : 1, len = 1.75 - (i % 3) * 0.12, tail = -0.26 * dir, tip = dir * (len + 0.26);
        const hw = 0.23, a = [dir * len, y + hw, 0], c = [dir * len, y - hw, 0], run = Math.abs(tip - a[0]);
        solid(pf, [
            [[0, 1, 0], [0, y + hw, 0]], [[0, -1, 0], [0, y - hw, 0]],
            [[-dir, 0, 0], [tail, 0, 0]],
            [[dir * hw, run, 0], a], [[dir * hw, -run, 0], c],
            [[0, 0, 1], [0, 0, 0.17]], [[0, 0, -1], [0, 0, 0.07]]
        ], BOARD, 1);
    }
    const groups = [
        { c: [HOUSE.x, PLAIN + 4.5 * HOUSE.k, HOUSE.z], r: 13 * HOUSE.k },
        { c: [POST.x, PLAIN + 2.6 * POST.k, POST.z], r: 4 * POST.k }
    ];
    return { solids, groups };
}

function rayConvex(o, d, planes) {
    let near = -1e12, far = 1e12, nn = null;
    for (const p of planes) {
        const den = p.n[0] * d[0] + p.n[1] * d[1] + p.n[2] * d[2];
        const dist = p.d - (p.n[0] * o[0] + p.n[1] * o[1] + p.n[2] * o[2]);
        if (Math.abs(den) < 1e-10) { if (dist < 0) return null; continue; }
        const t = dist / den;
        if (den < 0) { if (t > near) { near = t; nn = p.n; } } else if (t < far) far = t;
        if (near > far) return null;
    }
    return near > 0 ? [near, nn] : null;
}

/* ---------- renderer ---------- */
function renderer(H, flow, forest) {
    const { solids, groups } = buildProps();
    const height = (x, z) => {
        const fx = clamp(x / CELL, 0, N - 1.001), fz = clamp(z / CELL, 0, N - 1.001);
        const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = j * N + i;
        return (H[k] * (1 - u) + H[k + 1] * u) * (1 - v) + (H[k + N] * (1 - u) + H[k + N + 1] * u) * v;
    };
    const smooth = (A, x, z) => {
        const fx = clamp(x / CELL, 0, N - 1.001), fz = clamp(z / CELL, 0, N - 1.001);
        const i = fx | 0, j = fz | 0, u = fx - i, v = fz - j, k = j * N + i;
        return (A[k] * (1 - u) + A[k + 1] * u) * (1 - v) + (A[k + N] * (1 - u) + A[k + N + 1] * u) * v;
    };

    // individual conifers: a jittered lattice of slim cones
    const TREE = 6.5;
    const canopy = (x, z) => {
        const m = smooth(forest, x, z);
        if (m < 0.03) return 0;
        const ci = Math.floor(x / TREE), cj = Math.floor(z / TREE);
        let top = 0;
        for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
            const r1 = hash2(i, j), r2 = hash2(i + 91, j + 37), r3 = hash2(i + 13, j + 151);
            if (r3 > m * 0.82) continue;
            const px = (i + 0.2 + 0.6 * r1) * TREE, pz = (j + 0.2 + 0.6 * r2) * TREE;
            const h = (10 + 16 * r2 + 10 * r1) * (0.6 + 0.4 * m), rad = h * (0.16 + 0.06 * r3);
            const dd = Math.hypot(x - px, z - pz);
            if (dd < rad * 1.25) {
                // drooping tiers of branches with a ragged edge
                const d = dd / rad + (n2(x / 0.9, z / 0.9) - 0.5) * 0.55;
                if (d < 1) {
                    const c = h * (1 - d) * (0.84 + 0.16 * Math.sin(d * 21 + r1 * 6));
                    if (c > top) top = c;
                }
            }
        }
        return top;
    };
    const surface = (x, z) => height(x, z) + canopy(x, z);

    const eye = [CAM.x, height(CAM.x, CAM.z) + CAM.eye, CAM.z];
    const cy = Math.cos(CAM.pitch), sy = Math.sin(CAM.pitch), ca = Math.cos(CAM.yaw), sa = Math.sin(CAM.yaw);
    const fwd = [sa * cy, sy, ca * cy], right = [ca, 0, -sa], up = [-sa * sy, cy, -ca * sy];
    const tanF = Math.tan(CAM.fov / 2);
    const rayDir = (u, v) => norm([0, 1, 2].map(i => fwd[i] + right[i] * u * tanF + up[i] * v * tanF));

    function hitProps(o, d, tMax) {
        let best = null;
        for (let g = 0; g < groups.length; g++) {
            const G = groups[g], cx = G.c[0] - o[0], cy2 = G.c[1] - o[1], cz = G.c[2] - o[2];
            const along = cx * d[0] + cy2 * d[1] + cz * d[2];
            if (cx * cx + cy2 * cy2 + cz * cz - along * along > G.r * G.r) continue;
            for (const s of solids) {
                if (s.group !== g) continue;
                const h = rayConvex(o, d, s.planes);
                if (h && h[0] < tMax) { tMax = h[0]; best = { t: h[0], n: h[1], s }; }
            }
        }
        return best;
    }

    function march(o, d) {
        let t = 8, prev = t;
        while (t < 44000) {
            const x = o[0] + d[0] * t, y = o[1] + d[1] * t, z = o[2] + d[2] * t;
            if (x < 0 || z < 0 || x > S || z > S) return -1;
            if (y > 4950 && d[1] > 0) return -1;
            const base = height(x, z);
            let gap = y - base;
            if (gap < 45 && t < 9000) gap = y - base - canopy(x, z);
            if (gap < 0) {
                let a = prev, b = t;
                for (let i = 0; i < 8; i++) {
                    const m = (a + b) / 2;
                    if (o[1] + d[1] * m < surface(o[0] + d[0] * m, o[2] + d[2] * m)) b = m; else a = m;
                }
                return (a + b) / 2;
            }
            prev = t;
            t += Math.max(0.8 + t * (y > 2300 ? 0.00022 : 0.0011), gap * 0.33);
        }
        return -1;
    }

    function shadow(x, y, z, dist) {
        if (hitProps([x, y, z], SUN, 60)) return 0;
        let res = 1, t = 2.5;
        for (let i = 0; i < 70 && t < 9000; i++) {
            const px = x + SUN[0] * t, py = y + SUN[1] * t, pz = z + SUN[2] * t;
            if (py > 4950) break;
            const base = height(px, pz);
            let gap = py - base;
            if (gap < 45 && dist < 5000) gap = py - base - canopy(px, pz);
            if (gap < 0) return 0;
            res = Math.min(res, 14 * gap / t);
            t += Math.max(2 + t * 0.04, gap * 0.55);
        }
        return sstep(0, 1, res);
    }

    function normal(x, z, e, t) {
        const near = t < 2600;
        const crag = t > 5000;
        const bump = (a, b) => (near ? surface(a, b) : height(a, b)) + (crag ? (ridged(a / 170, b / 170, 4) - 0.42) * 44 * sstep(1900, 2500, height(a, b)) : 0) + (t < 900 ? (fbm(a / 3.1, b / 3.1, 3) - 0.5) * 0.5 + (fbm(a / 13, b / 13, 3) - 0.5) * 2.2 : 0) + (near && smooth(forest, a, b) > 0.03 ? (fbm(a / 1.2, b / 1.2, 3) - 0.5) * 3.4 : 0) + (e < 40 ? (fbm(a / 34, b / 34, 5) - 0.5) * 12 * (1 - e / 40) : 0);
        const dx = bump(x + e, z) - bump(x - e, z), dz = bump(x, z + e) - bump(x, z - e);
        return norm([-dx, 2 * e, -dz]);
    }

    function grassColour(x, z, t, big, mid, fine) {
        const lush = sstep(0.36, 0.64, big + (mid - 0.5) * 0.6);
        const fv = 0.84 + (fine - 0.5) * 0.7 + (mid - 0.5) * 0.45;
        let c = [mix(0.122, 0.058, lush) * fv, mix(0.132, 0.09, lush) * fv, mix(0.052, 0.033, lush) * fv];
        if (t < 1100) {
            const g = fbm(x / 0.9, z / 2.1, 3);
            const k = (0.72 + 0.62 * g) * (t < 520 ? 0.72 + 0.56 * fbm(x / 0.22, z / 0.5, 2) : 1);
            c = c.map(v => v * k);
            // wildflowers
            const cx = Math.floor(x / 0.55), cz = Math.floor(z / 0.55), r = hash2(cx, cz), meadow = sstep(0.42, 0.62, fbm(x / 34, z / 34, 3));
            const dot2 = Math.hypot(x / 0.55 - cx - 0.5, z / 0.55 - cz - 0.5);
            if (r > 1 - 0.3 * meadow && dot2 < 0.2 + 0.2 * hash2(cx + 3, cz + 9)) {
                const kind = hash2(cx + 7, cz + 3);
                c = kind < 0.45 ? [0.62, 0.54, 0.09] : kind < 0.75 ? [0.72, 0.72, 0.68] : [0.3, 0.13, 0.42];
            }
        }
        return c;
    }

    function terrainAlbedo(x, y, z, n, t) {
        const slope = 1 - n[1];
        const big = fbm(x / 900, z / 900, 5), mid = fbm(x / 130, z / 130, 4), fine = fbm(x / 17, z / 17, 3);
        const f = smooth(flow, x, z);
        const ground = height(x, z), tree = smooth(forest, x, z);

        let c = grassColour(x, z, t, big, mid, fine).map(v => v * (1 - 0.55 * tree));
        const tundra = sstep(2050, 2600, y + (big - 0.5) * 500);
        c = c.map((v, i) => mix(v, [0.115, 0.115, 0.07][i] * (0.82 + (fine - 0.5)), tundra));

        // the road: pale gravel with two wheel ruts and a grassy crown
        const road = roadDist(x, z);
        if (road < 3.2) {
            const w = 2.2 + (fine - 0.5) * 1.1, edge = 1 - sstep(w - 0.5, w + 0.3, road);
            const grain = 0.8 + 0.5 * fbm(x / 0.8, z / 0.8, 3);
            const rut = sstep(0.25, 0.75, road) * (1 - sstep(0.9, 1.5, road));
            const gravel = [0.43 * grain, 0.385 * grain, 0.31 * grain].map(v => v * (1 - 0.14 * rut));
            const crown = (1 - sstep(0.1, 0.3, road)) * 0.3;
            c = c.map((v, i) => mix(mix(v, gravel[i], edge), v, crown * edge));
        }

        // the shore: mud, then stones
        const bank = y - LAKE;
        if (bank < 0.9 && lakeS(x, z) < 1.6) {
            const pebble = 0.7 + 0.8 * fbm(x / 1.4, z / 1.4, 3);
            const mud = [0.2 * pebble, 0.18 * pebble, 0.15 * pebble];
            const k = 1 - sstep(0.1, 0.55 + (fine - 0.5) * 0.5, bank);
            c = c.map((v, i) => mix(v, mud[i], k));
        }

        // conifers: dark crowns over deep shade, plus a far-field substitute when cones are sub-pixel
        const above = y - ground;
        const trees = t < 9000 ? clamp(above / 1.2) : tree;
        if (trees > 0) {
            const crown = (0.5 + 1.1 * fbm(x / 21, z / 21, 3)) * (0.6 + 0.8 * mid) * (t < 2600 ? 0.45 + 1.1 * fbm(x / 1.1, z / 1.1, 3) : 1);
            const shade = t < 9000 ? 0.55 + 1.1 * clamp(above / 22) : 0.95;
            const kind = hash2(Math.floor(x / 90), Math.floor(z / 90)) * 0.35 + 0.82;
            const col = [0.026 * kind, 0.04, 0.027].map(v => v * crown * shade);
            c = c.map((v, i) => mix(v, col[i], trees));
        }

        // granite: warm-grey, jointed
        const strata = 0.93 + 0.14 * (n2((y + big * 1100) / 46 + mid * 7, x / 900) - 0.5);
        const joint = 1 - 0.34 * sstep(0.62, 0.8, ridged(x / 62, z / 62 + y / 120, 3));
        const tone = (0.055 + 0.17 * mid) * strata * joint;
        const rock = [tone * 1.12, tone * 0.99, tone * 0.88];
        let rocky = sstep(0.2, 0.42, slope + (mid - 0.5) * 0.22) * (1 - trees * 0.9);
        rocky = Math.max(rocky, sstep(2450, 2950, y + (big - 0.5) * 900 + (mid - 0.5) * 500));
        rocky = Math.max(rocky, sstep(4.2, 6.5, f) * sstep(1900, 2400, y) * 0.7) * sstep(1500, 1700, y);
        c = c.map((v, i) => mix(v, rock[i], rocky));

        // snow on the summits, ice tongues reaching down along the drainage
        const tongue = sstep(3.7, 5.6, f + (mid - 0.5) * 1.6);
        const line = 3170 + (big - 0.5) * 760 + (mid - 0.5) * 340 + slope * 620 - tongue * 760;
        const hold = 1 - sstep(0.3, 0.52, slope + (mid - 0.5) * 0.28 + (fine - 0.5) * 0.16 - tongue * 0.18);
        const snow = sstep(line - 40, line + 60, y) * hold;
        if (snow > 0) {
            const low = 1 - sstep(2100, 3000, y);
            const crack = low * sstep(0.68, 0.84, ridged(x / 150, z / 46, 3));
            const dirt = (1 - sstep(1850, 2250, y)) * 0.55;
            const ice = [mix(0.86, 0.52, low), mix(0.9, 0.64, low), mix(0.96, 0.74, low)]
                .map((v, i) => mix(v * (1 - crack * 0.55), [0.26, 0.24, 0.22][i], dirt));
            c = c.map((v, i) => mix(v, ice[i], snow));
        }
        return c;
    }

    const gable = (lz, ly) => Math.abs(lz) < 0.6 && ly > 4.3 && ly < 5.5;

    function propAlbedo(h, p) {
        const f = h.s.f, rel = [p[0] - f.o[0], p[1] - f.o[1], p[2] - f.o[2]];
        const lx = dot(rel, f.ax) / f.k, ly = rel[1] / f.k, lz = dot(rel, f.az) / f.k;
        const grain = 0.75 + 0.6 * fbm(lx * 1.6 + lz * 1.6, ly * 26, 3);
        switch (h.s.mat) {
            case WOOD: {
                const front = Math.abs(dot(h.n, f.az)) > 0.7;
                if (front && lz < 0) {
                    const win = (cx, y0, y1, hw) => Math.abs(lx - cx) < hw && ly > y0 && ly < y1;
                    for (const cx of [-3.9, 3.9]) if (win(cx, 1.5, 2.9, 0.72)) {
                        const bar = Math.abs(lx - cx) < 0.05 || Math.abs(ly - 2.2) < 0.05 || Math.abs(lx - cx) > 0.64 || ly < 1.57 || ly > 2.83;
                        return bar ? [0.46, 0.42, 0.34] : [0.03, 0.045, 0.06];
                    }
                    if (win(0, 0.7, 2.75, 0.62)) return [0.09 * grain, 0.05 * grain, 0.03 * grain];
                }
                if (Math.abs(dot(h.n, f.ax)) > 0.7 && gable(lz, ly)) return [0.03, 0.045, 0.06];
                const log = Math.abs(((ly / 0.27) % 1) - 0.5) * 2;           // rounded logs with dark seams
                const seam = 0.3 + 0.7 * sstep(0.04, 0.26, 1 - log);
                return [0.105 * grain * seam, 0.056 * grain * seam, 0.028 * grain * seam];
            }
            case ROOF: {
                const row = Math.floor(ly * 7 + lz * 1.1), s = hash2(Math.floor(lx * 3 + row * 0.5), row);
                const v = 0.035 + 0.04 * s;
                return [v * 1.2, v, v * 0.82];
            }
            case STONE: {
                const s = 0.14 + 0.2 * fbm(lx * 3 + lz * 3, ly * 4, 3);
                return [s * 1.04, s, s * 0.94];
            }
            case BOARD: return [0.19 * grain, 0.125 * grain, 0.075 * grain];
            default: return [0.11 * grain, 0.07 * grain, 0.04 * grain];
        }
    }

    function sky(d) {
        const h = clamp(d[1] * 2.6);
        const z = [0.07, 0.2, 0.5], o = [0.56, 0.7, 0.88];
        const k = Math.pow(1 - h, 3.2);
        const c = z.map((v, i) => mix(v, o[i], k));
        const s = Math.max(0, dot(d, SUN));
        return c.map(v => v + Math.pow(s, 90) * 0.5);
    }

    const BASE = 5600, TOP = 9000;
    function cloudDensity(x, y, z, cheap, clear = 0) {
        const hf = (y - BASE) / (TOP - BASE);
        if (hf < 0 || hf > 1) return 0;
        const shape = sstep(0, 0.07, hf) * (1 - sstep(0.3, 1, hf));
        const q = 1 / 4300;
        const px = x * q + 3.7, py = y * q * 1.35, pz = z * q - 1.3;
        let d = 0.55 * n3(px, py, pz) + 0.3 * n3(px * 2.3 + 3, py * 2.3, pz * 2.3 + 7);
        if (!cheap) d += 0.2 * n3(px * 5.1, py * 5.1 + 2, pz * 5.1) + 0.12 * n3(px * 11, py * 11, pz * 11 + 5) + 0.07 * n3(px * 23, py * 23, pz * 23);
        return clamp((d - (cheap ? 0.56 : 0.76) - clear - 0.26 * (1 - shape)) * 7);
    }

    function clouds(o, d, base, jitter) {
        if (d[1] < 0.004) return base;
        const t0 = (BASE - o[1]) / d[1], t1 = Math.min((TOP - o[1]) / d[1], t0 + 16000);
        if (t0 > 120000) return base;
        const ex = d[0] / d[2], ey = d[1] / d[2];
        const clear = 0.4 * (1 - sstep(0.34, 0.5, Math.abs(ex + 0.02))) * sstep(0.17, 0.23, ey);
        const steps = 72, dt = (t1 - t0) / steps;
        let trans = 1, r = 0, g = 0, b = 0, t = t0 + dt * jitter;
        for (let i = 0; i < steps && trans > 0.01; i++, t += dt) {
            const x = o[0] + d[0] * t, y = o[1] + d[1] * t, z = o[2] + d[2] * t;
            const den = cloudDensity(x, y, z, false, clear);
            if (den > 0.002) {
                let od = 0;
                for (let k = 1; k <= 3; k++) od += cloudDensity(x + SUN[0] * 260 * k * k, y + SUN[1] * 260 * k * k, z + SUN[2] * 260 * k * k, true);
                const light = Math.exp(-od * 1.5);
                const amb = 0.5 + 0.5 * (y - BASE) / (TOP - BASE);
                const a = 1 - Math.exp(-den * dt * 0.006);
                r += trans * a * (0.5 * amb + 1.02 * light); g += trans * a * (0.55 * amb + 0.99 * light); b += trans * a * (0.68 * amb + 0.94 * light);
                trans *= 1 - a;
            }
        }
        const fade = 1 - sstep(60000, 118000, t0);
        const k = trans + (1 - trans) * (1 - fade);
        return [base[0] * k + r * fade, base[1] * k + g * fade, base[2] * k + b * fade];
    }

    function lit(a, n, p, dist) {
        const ndl = Math.max(0, dot(n, SUN));
        const cover = sstep(0.5, 0.6, fbm((p[0] + 900) / 2100, (p[2] - 300) / 2100, 4));
        const vis = ndl > 0 ? shadow(p[0] + n[0] * 0.3, p[1] + n[1] * 0.3 + 0.2, p[2] + n[2] * 0.3, dist) * (1 - 0.72 * cover) : 0;
        const amb = 0.5 + 0.5 * n[1];
        return [
            a[0] * (2.9 * ndl * vis + 0.42 * amb + 0.08),
            a[1] * (2.75 * ndl * vis + 0.47 * amb + 0.09),
            a[2] * (2.4 * ndl * vis + 0.56 * amb + 0.1)
        ];
    }

    const air = (c, t) => {
        const fog = 1 - Math.exp(-Math.max(0, t - 2500) / 52000), col = [0.62, 0.74, 0.9];
        return c.map((v, i) => mix(v, col[i], fog));
    };

    /** Distance along the ray to the lake surface, or -1 when something else is hit first. */
    function waterHit(o, d, t, prop) {
        if (d[1] >= 0) return -1;
        const tw = (LAKE - o[1]) / d[1];
        const wx = o[0] + d[0] * tw, wz = o[2] + d[2] * tw;
        return tw > 0 && (t < 0 || tw < t) && (!prop || tw < prop.t) && height(wx, wz) < LAKE && lakeS(wx, wz) < 1.6 ? tw : -1;
    }

    function shadeFrom(o, d, jitter, bounces) {
        const t = march(o, d);
        const prop = hitProps(o, d, t < 0 ? 44000 : t);

        const tw = bounces > 0 ? waterHit(o, d, t, prop) : -1;
        if (tw > 0) return water(d, tw, o[0] + d[0] * tw, o[2] + d[2] * tw, jitter, bounces);
        if (prop) {
            const p = [o[0] + d[0] * prop.t, o[1] + d[1] * prop.t, o[2] + d[2] * prop.t];
            return air(lit(propAlbedo(prop, p), prop.n, p, prop.t), prop.t);
        }
        if (t < 0) return clouds(o, d, sky(d), jitter);
        const x = o[0] + d[0] * t, y = o[1] + d[1] * t, z = o[2] + d[2] * t;
        const e = Math.max(CELL * 0.08, t * 0.00042);
        const n = normal(x, z, Math.max(e, t > 2600 ? CELL * 0.7 : e), t);
        return air(lit(terrainAlbedo(x, y, z, n, t), n, [x, y, z], t), t);
    }

    function water(d, tw, wx, wz, jitter, bounces) {
        // a calm surface: long soft swells with cat's paws where the wind touches it
        const wind = sstep(0.5, 0.68, fbm(wx / 95, wz / 60, 3));
        const a = 0.0028 + 0.007 * wind;
        const dx = (fbm(wx / 2.6, wz / 7, 3) - 0.5) + (fbm(wx / 0.7, wz / 2.2, 2) - 0.5) * 0.4;
        const dz = (fbm(wx / 2.6 + 19, wz / 7 + 7, 3) - 0.5) + (fbm(wx / 0.7 + 3, wz / 2.2 + 11, 2) - 0.5) * 0.4;
        const n = norm([dx * a * 2, 1, dz * a * 6]);
        const k = 2 * dot(d, n);
        const r = norm([d[0] - k * n[0], Math.max(0.004, d[1] - k * n[1]), d[2] - k * n[2]]);
        const refl = shadeFrom([wx, LAKE + 0.05, wz], r, jitter, bounces - 1);
        const F = 0.02 + 0.98 * Math.pow(1 - Math.abs(dot(d, n)), 5);
        const depth = clamp((LAKE - height(wx, wz)) / 3.5);
        const deep = [mix(0.07, 0.012, depth), mix(0.125, 0.09, depth), mix(0.15, 0.155, depth)];
        // a soft reflection over blue water: the peaks show, but it isn't a mirror
        const K = clamp(F * 0.8 + 0.16), tint = [0.86, 0.93, 1];
        return air([0, 1, 2].map(i => mix(deep[i], refl[i] * tint[i] * 0.8, K)), tw);
    }

    const shade = (d, jitter) => shadeFrom(eye, d, jitter, 1);

    const tone = (v) => {
        v = Math.max(0, v) * 0.82;
        v = (v * (2.51 * v + 0.03)) / (v * (2.43 * v + 0.59) + 0.14);
        return 255 * Math.pow(clamp(v), 1 / 2.2);
    };

    const project = (x, y, z) => {
        const p = [x - eye[0], y - eye[1], z - eye[2]];
        const dist = dot(p, fwd), W = 1600, Hh = 900;
        return { x: +((dot(p, right) / (dist * tanF) * 0.5 + 0.5) * W).toFixed(1), y: +((0.5 - dot(p, up) / (dist * tanF) * 0.5 * (W / Hh)) * Hh).toFixed(1), dist: Math.round(dist) };
    };

    const isWater = (d) => { const t = march(eye, d); return waterHit(eye, d, t, hitProps(eye, d, t < 0 ? 44000 : t)) > 0; };

    return { rayDir, shade, tone, project, height, isWater };
}

const FILES = ['height.f32', 'flow.f32', 'forest.f32'];
function loadShared(dir) {
    return FILES.map((f) => {
        const b = fs.readFileSync(path.join(dir, f));
        const sab = new SharedArrayBuffer(b.length);
        new Uint8Array(sab).set(b);
        return sab;
    });
}

function finishMaps(dir, H, flow) {
    weather(H);
    shapePlain(H);
    const F = buildForest(H), fl = blurFlow(flow);
    [[H, 'height.f32'], [fl, 'flow.f32'], [F, 'forest.f32']].forEach(([arr, f]) => fs.writeFileSync(path.join(dir, f), Buffer.from(arr.buffer)));
}

function writePNG(file, w, h, rgb, ch = 3) {
    const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
    const crc = (b) => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
    const chunk = (t, d) => {
        const b = Buffer.alloc(12 + d.length);
        b.writeUInt32BE(d.length, 0); b.write(t, 4, 'latin1'); d.copy(b, 8);
        b.writeUInt32BE(crc(b.subarray(4, 8 + d.length)), 8 + d.length);
        return b;
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = ch === 4 ? 6 : 2;
    const raw = Buffer.alloc((w * ch + 1) * h);
    for (let y = 0; y < h; y++) Buffer.from(rgb.buffer, y * w * ch, w * ch).copy(raw, y * (w * ch + 1) + 1);
    fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]));
}

/** Sawn timber: warped growth rings, fine fibres and a few knots. Neutral, tinted in CSS. */
function wood(file, w, h, plank, seams) {
    const rgb = new Uint8Array(w * h * 3);
    for (let p = 0; p * plank < h; p++) {
        const seed = hash2(p * 7 + 3, 11) * 200, shift = hash2(p, 5) * 900;
        const knots = Array.from({ length: 2 }, (_, i) => [hash2(p + i * 9, 21) * w, (p + 0.28 + 0.44 * hash2(p, 33 + i)) * plank, 12 + 26 * hash2(i, p + 2)]);
        for (let y = p * plank; y < Math.min(h, (p + 1) * plank); y++) for (let x = 0; x < w; x++) {
            let yy = y;
            let dark = 0;
            for (const [kx, ky, kr] of knots) {
                const r2 = ((x - kx) / (kr * 2.4)) ** 2 + ((y - ky) / kr) ** 2;
                yy += (y - ky) * 1.5 * Math.exp(-r2 * 0.5);
                dark = Math.max(dark, Math.exp(-r2 * 5));
            }
            const px = x + shift;
            const warp = fbm(px / 520, yy / 70 + seed, 4) * 26;
            const rings = 0.5 + 0.5 * Math.sin((yy / 8.5 + warp + seed) * 1.7);
            const fibre = fbm(px / 150, yy / 1.25 + seed, 4);
            const blot = fbm(px / 300, yy / 48 + seed * 2, 4);
            let v = 0.62 + 0.32 * (fibre - 0.5) * 2 + 0.2 * (rings - 0.5) + 0.34 * (blot - 0.5) + (hash2(p, 77) - 0.5) * 0.16;
            v *= 1 - 0.72 * dark;
            if (seams) {
                const e = Math.min(y - p * plank, (p + 1) * plank - 1 - y);
                v *= e < 2 ? 0.16 : e < 5 ? 0.72 : 1;
                if (y - p * plank >= 2 && y - p * plank < 5) v *= 1.22;
            }
            const k = (y * w + x) * 3, g = clamp(v) * 255;
            rgb[k] = g; rgb[k + 1] = g * 0.94; rgb[k + 2] = g * 0.86;
        }
    }
    writePNG(file, w, h, rgb);
}

/** The name written in cloud: billows grown out of the lettering, lit like the sky's clouds. */
function nameCloud(maskFile, file) {
    const W = 2400, H = 560, mask = fs.readFileSync(maskFile);
    const blur = (src, r) => {
        let a = Float32Array.from(src);
        for (let pass = 0; pass < 3; pass++) {
            const b = new Float32Array(W * H), c = new Float32Array(W * H), n = 2 * r + 1;
            for (let y = 0; y < H; y++) { let t = 0; for (let x = -r; x <= r; x++) t += a[y * W + clamp(x, 0, W - 1)]; for (let x = 0; x < W; x++) { b[y * W + x] = t / n; t += a[y * W + Math.min(W - 1, x + r + 1)] - a[y * W + Math.max(0, x - r)]; } }
            for (let x = 0; x < W; x++) { let t = 0; for (let y = -r; y <= r; y++) t += b[clamp(y, 0, H - 1) * W + x]; for (let y = 0; y < H; y++) { c[y * W + x] = t / n; t += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
            a = c;
        }
        return a;
    };
    const m = Float32Array.from(mask, v => v / 255), core = blur(m, 9), soft = blur(m, 26);
    const at = (A, x, y) => A[clamp(y | 0, 0, H - 1) * W + clamp(x | 0, 0, W - 1)];
    const puff = (x, y, z) => 1 - Math.abs(2 * n3(x, y, z) - 1);
    const dens = new Float32Array(W * H), thick = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const wx = x + (fbm(x / 150 + 3, y / 150, 4) - 0.5) * 72, wy = y + (fbm(x / 150 + 9, y / 150 + 7, 4) - 0.5) * 72;
        const c = at(core, wx, wy), s = at(soft, wx, wy);
        const B = 0.48 * puff(x / 62, y / 62, 1.3) + 0.3 * puff(x / 27, y / 27, 4.1) + 0.14 * puff(x / 12, y / 12, 7.7) + 0.08 * puff(x / 6, y / 6, 2.2);
        const d = c * 0.95 + s * 0.6 - 0.62 + (B - 0.6) * 1.35;
        dens[y * W + x] = d;
        thick[y * W + x] = (s * 0.8 + c * 0.25) * 62 + B * 34;
    }
    const smoothThick = blur(thick, 2), rgba = new Uint8Array(W * H * 4), sun = norm([-0.5, -0.62, 0.6]);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const k = y * W + x, d = dens[k];
        const nrm = norm([smoothThick[k - 1] - smoothThick[k + 1], smoothThick[k - W] - smoothThick[k + W], 7]);
        // sun from the upper left; shade collects low on each billow and under the letters
        const under = clamp((at(soft, x + 13, y + 28) - at(soft, x, y)) * 1.8 + 0.08);
        const lit = clamp(0.74 + 0.5 * dot(nrm, sun) - under * 0.3);
        const halo = at(soft, x, y) * (0.5 + 0.5 * fbm(x / 40, y / 40, 3));
        const thin = sstep(0.32, 0.68, fbm(x / 210 + 5, y / 120 + 2, 4));   // patches where the vapour all but vanishes
        const a = Math.max(sstep(-0.04, 0.8, d) * 0.3, sstep(0.03, 0.6, halo) * 0.17) * (0.2 + 0.8 * thin);
        const t = sstep(0.42, 0.98, lit);
        rgba[k * 4] = 255 * mix(0.66, 1, t); rgba[k * 4 + 1] = 255 * mix(0.73, 1, t); rgba[k * 4 + 2] = 255 * mix(0.85, 1, t); rgba[k * 4 + 3] = 255 * a;
    }
    writePNG(file, W, H, rgba, 4);
}

/* ---------- entry points ---------- */
if (!isMainThread) {
    const { W, Hh, shared, rowCounter, maps } = workerData;
    const [H, flow, forest] = maps.map(m => new Float32Array(m));
    const r = renderer(H, flow, forest);
    const out = new Uint8Array(shared), counter = new Int32Array(rowCounter);
    for (;;) {
        const y = Atomics.add(counter, 0, 1);
        if (y >= Hh) break;
        for (let x = 0; x < W; x++) {
            const u = (x + 0.5) / W * 2 - 1, v = (1 - (y + 0.5) / Hh * 2) * (Hh / W);
            const c = r.shade(r.rayDir(u, v), (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1 + 1) % 1);
            const k = (y * W + x) * 3;
            out[k] = r.tone(c[0]); out[k + 1] = r.tone(c[1]); out[k + 2] = r.tone(c[2]);
        }
    }
    parentPort.postMessage('done');
} else {
    const [mode, dir, a, b] = process.argv.slice(2);
    if (mode === 'build') {
        fs.mkdirSync(dir, { recursive: true });
        console.time('height');
        const H = buildHeight();
        console.timeEnd('height');
        console.time('erode');
        const flow = erode(H, Number(a) || 16000000);
        console.timeEnd('erode');
        console.log('peak', Math.round(H.reduce((p, v) => Math.max(p, v), 0)));
        fs.writeFileSync(path.join(dir, 'eroded.f32'), Buffer.from(H.buffer));
        fs.writeFileSync(path.join(dir, 'rawflow.f32'), Buffer.from(flow.buffer));
        finishMaps(dir, H, flow);
    } else if (mode === 'maps') {
        const read = (f) => { const b2 = fs.readFileSync(path.join(dir, f)); return new Float32Array(b2.buffer.slice(b2.byteOffset, b2.byteOffset + b2.length)); };
        finishMaps(dir, read('eroded.f32'), read('rawflow.f32'));
    } else if (mode === 'name') {
        nameCloud(path.join(dir, 'name-mask.u8'), path.join(dir, 'name-cloud.png'));
    } else if (mode === 'wood') {
        wood(path.join(dir, 'wood-planks.png'), 1400, 900, 164, true);
        wood(path.join(dir, 'wood-board.png'), 1400, 420, 420, false);
    } else if (mode === 'render') {
        const W = Number(a), Hh = Number(b);
        const shared = new SharedArrayBuffer(W * Hh * 3), rowCounter = new SharedArrayBuffer(4), maps = loadShared(dir);
        const self = fileURLToPath(import.meta.url);
        console.time('render');
        await Promise.all(Array.from({ length: os.cpus().length }, () => new Promise((res, rej) => {
            const w = new Worker(self, { workerData: { W, Hh, shared, rowCounter, maps } });
            w.on('message', res); w.on('error', rej);
        })));
        console.timeEnd('render');
        writePNG(path.join(dir, 'valley.png'), W, Hh, new Uint8Array(shared));
    } else if (mode === 'lake') {
        // where the water is, at twice the 1600x900 scene, cropped to the lake
        const [H, flow, forest] = loadShared(dir).map(m => new Float32Array(m));
        const r = renderer(H, flow, forest), W = 3200, Hh = 1800, y0 = 1200, on = new Uint8Array(W * (Hh - y0));
        let x0 = W, x1 = 0, top = Hh, bottom = 0;
        for (let y = y0; y < Hh; y++) for (let x = 0; x < W; x++) {
            if (!r.isWater(r.rayDir((x + 0.5) / W * 2 - 1, (1 - (y + 0.5) / Hh * 2) * (Hh / W)))) continue;
            on[(y - y0) * W + x] = 255;
            x0 = Math.min(x0, x); x1 = Math.max(x1, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
        x0 &= ~1; top &= ~1; x1 = (x1 | 1) + 1; bottom = (bottom | 1) + 1;
        const w = x1 - x0, h = bottom - top, rgb = new Uint8Array(w * h * 3);
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) rgb.fill(on[(y + top - y0) * W + x + x0], (y * w + x) * 3, (y * w + x) * 3 + 3);
        writePNG(path.join(dir, 'lake-mask.png'), w, h, rgb);
        console.log('lake', JSON.stringify({ x: x0 / 2, y: top / 2, w: w / 2, h: h / 2 }));
    } else if (mode === 'points') {
        const [H, flow, forest] = loadShared(dir).map(m => new Float32Array(m));
        const r = renderer(H, flow, forest);
        const show = (name, x, y, z) => console.log(name, JSON.stringify(r.project(x, y, z)));
        show('house base', HOUSE.x, PLAIN, HOUSE.z);
        show('house ridge', HOUSE.x, PLAIN + 7.4 * HOUSE.k, HOUSE.z);
        const c = Math.cos(HOUSE.yaw), s = Math.sin(HOUSE.yaw);
        show('chimney', HOUSE.x + HOUSE.k * (3.2 * c + 1.1 * s), PLAIN + 8.9 * HOUSE.k, HOUSE.z + HOUSE.k * (-3.2 * s + 1.1 * c));
        show('post base', POST.x, PLAIN, POST.z);
        show('post top', POST.x, PLAIN + 5.2 * POST.k, POST.z);
    }
}
