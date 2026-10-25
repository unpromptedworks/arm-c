// Insects in chocolate: simulate a lot with insect fragments in it and the
// FDA's examination of six 100 g subsamples (CPG Sec. 515.700, criterion 1).
"use strict";

const SUBS = 6;       // six 100-gram subsamples
const AVG_LIMIT = 60; // 1a: average of 60 or more per 100 g
const ONE_LIMIT = 90; // 1b: any one subsample with 90 or more

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

function normal() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Marsaglia and Tsang's gamma sampler, shape k, scale 1.
function gamma(k) {
  if (k < 1) return gamma(k + 1) * Math.pow(Math.random(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = normal(); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    if (Math.log(Math.random()) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
  }
}

function poisson(lambda) {
  let n = 0;
  while (lambda > 25) { n += poisson(25); lambda -= 25; }
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while (p > L);
  return n + k - 1;
}

// One subsample: its patch has a true density spread around the lot average
// with coefficient of variation cv; the fragments in it are a Poisson count.
function subsample(m, cv) {
  const lambda = cv === 0 ? m : m * cv * cv * gamma(1 / (cv * cv));
  return poisson(lambda);
}

function drawLot(m, cv) {
  const counts = [];
  for (let i = 0; i < SUBS; i++) counts.push(subsample(m, cv));
  return counts;
}

function examine(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  const avg = total / SUBS;
  const max = Math.max(...counts);
  const avgHit = avg >= AVG_LIMIT;
  const oneHit = max >= ONE_LIMIT;
  return { total, avg, max, avgHit, oneHit, action: avgHit || oneHit };
}

function actionRate(m, cv, runs) {
  let a = 0;
  for (let k = 0; k < runs; k++) if (examine(drawLot(m, cv)).action) a++;
  return a / runs;
}

function el(name, attrs, text) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}

function colors() {
  const css = getComputedStyle(document.documentElement);
  const v = (n) => css.getPropertyValue(n).trim();
  return { ink: v("--ink"), hair: v("--hair"), pen: v("--pen"), stamp: v("--stamp"), muted: v("--muted"), tint: v("--tint") };
}

function state() {
  return { m: +$("m").value, cv: +(+$("cv").value).toFixed(1) };
}

function showControls() {
  const { m, cv } = state();
  $("mOut").textContent = String(m);
  $("cvOut").textContent = cv === 0 ? "even" : Math.round(cv * 100) + "%";
  $("manyOut").textContent = "";
}

// Six squares, each dotted with its fragments.
function drawPieces(counts, r) {
  const svg = $("pieces");
  svg.replaceChildren();
  const c = colors();
  const S = 88, G = (600 - SUBS * S) / (SUBS - 1);
  for (let i = 0; i < SUBS; i++) {
    const x = i * (S + G), y = 2;
    const n = counts ? counts[i] : 0;
    const hot = counts && n >= ONE_LIMIT;
    svg.append(el("rect", { x, y, width: S, height: S, fill: c.tint, stroke: hot ? c.stamp : c.ink, "stroke-width": hot ? 3 : 1 }));
    for (let k = 0; k < n; k++) {
      svg.append(el("rect", {
        x: (x + 4 + Math.random() * (S - 10)).toFixed(1), y: (y + 4 + Math.random() * (S - 10)).toFixed(1),
        width: 2, height: 2, fill: hot ? c.stamp : c.pen,
      }));
    }
    svg.append(el("text", { x: x + S / 2, y: S + 22, "text-anchor": "middle", style: hot ? "fill:" + c.stamp : "" },
      counts ? String(n) : "100 g"));
  }
}

// Number line of the six counts, with both limits.
const X1 = 150, W = 600;
const xs = (n) => 20 + (Math.min(Math.max(n, 0), X1) / X1) * (W - 40);

function drawStrip(counts, r) {
  const svg = $("strip");
  svg.replaceChildren();
  const c = colors();
  const base = 64;
  svg.append(el("line", { x1: 20, x2: W - 20, y1: base, y2: base, stroke: c.ink }));
  for (let g = 0; g <= X1; g += 10) {
    svg.append(el("line", { x1: xs(g), x2: xs(g), y1: base, y2: base + (g % 50 ? 4 : 7), stroke: c.ink }));
    if (g % 30 === 0) svg.append(el("text", { x: xs(g), y: base + 20, "text-anchor": "middle" }, String(g)));
  }
  svg.append(el("text", { x: W - 20, y: base + 36, "text-anchor": "end" }, "fragments per 100 g"));
  svg.append(el("rect", { x: xs(ONE_LIMIT), y: 14, width: xs(X1) - xs(ONE_LIMIT), height: base - 14, fill: c.stamp, opacity: 0.08 }));
  svg.append(el("line", { x1: xs(AVG_LIMIT), x2: xs(AVG_LIMIT), y1: 10, y2: base, stroke: c.stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(AVG_LIMIT) - 4, y: 10, "text-anchor": "end", style: "fill:" + c.stamp }, "60 average"));
  svg.append(el("line", { x1: xs(ONE_LIMIT), x2: xs(ONE_LIMIT), y1: 10, y2: base, stroke: c.stamp, "stroke-dasharray": "4 3" }));
  svg.append(el("text", { x: xs(ONE_LIMIT) + 4, y: 10, style: "fill:" + c.stamp }, "90 any one"));
  if (!counts) return;
  [...counts].sort((a, b) => a - b).forEach((n, k) => {
    const hot = n >= ONE_LIMIT;
    svg.append(el("circle", { cx: xs(n), cy: 22 + (k % 3) * 12, r: 5, fill: hot ? c.stamp : "none", stroke: hot ? c.stamp : c.pen, "stroke-width": 2 }));
  });
  svg.append(el("line", { x1: xs(r.avg), x2: xs(r.avg), y1: base - 10, y2: base + 8, stroke: c.pen, "stroke-width": 3 }));
  svg.append(el("text", { x: xs(r.avg), y: base + 36, "text-anchor": "middle", style: "fill:" + c.pen }, "avg"));
}

function showResult(r) {
  $("fTot").textContent = String(r.total);
  $("fAvg").textContent = r.avg.toFixed(1);
  $("fMax").textContent = String(r.max);
  const st = $("stamp");
  st.className = "stamp " + (r.action ? "fail" : "pass");
  st.textContent = r.action ? "Action" : "No action";
  let why;
  if (r.avgHit && r.oneHit) why = "Average " + r.avg.toFixed(1) + ", and one subsample has " + r.max + ".";
  else if (r.avgHit) why = "Average " + r.avg.toFixed(1) + " per 100 g: criterion 1a.";
  else if (r.oneHit) why = "Average only " + r.avg.toFixed(1) + ", but one subsample has " + r.max + ": criterion 1b.";
  else why = "Average " + r.avg.toFixed(1) + ", highest " + r.max + ". Both under the limits.";
  $("reason").textContent = why;
}

let last = null;

function takeOne() {
  const { m, cv } = state();
  const counts = drawLot(m, cv);
  const r = examine(counts);
  last = [counts, r];
  drawPieces(counts, r);
  drawStrip(counts, r);
  showResult(r);
}

function takeMany() {
  const { m, cv } = state();
  let a = 0, b = 0;
  for (let k = 0; k < 1000; k++) {
    const r = examine(drawLot(m, cv));
    if (r.avgHit) a++;
    else if (r.oneHit) b++;
  }
  $("manyOut").innerHTML = "Of 1,000 lots like yours, <b class=\"red mono\">" + (a + b).toLocaleString("en-US") +
    "</b> drew action: " + a + " on the average, " + b + " on a single subsample alone.";
}

// Heat map of the chance of action.
const MS = [], CVS = [];
for (let m = 0; m <= 80; m += 4) MS.push(m);
for (let k = 0; k <= 15; k++) CVS.push(k / 10);
let grid = null;

function computeGrid() {
  grid = CVS.map((cv) => MS.map((m) => actionRate(m, cv, 300)));
}

function drawMap() {
  const svg = $("map");
  svg.replaceChildren();
  const c = colors();
  const L = 64, T = 36, CW = 26, CH = 14;
  const { m, cv } = state();
  const shade = (p) => (0.03 + 0.87 * p).toFixed(3);

  CVS.forEach((s, j) => {
    MS.forEach((mm, i) => {
      const p = grid[j][i];
      const rect = el("rect", {
        x: L + i * CW, y: T + (CVS.length - 1 - j) * CH, width: CW - 1, height: CH - 1,
        fill: c.stamp, "fill-opacity": shade(p),
      });
      rect.append(el("title", {}, mm + " per 100 g, patchiness " + Math.round(s * 100) + "%: " + Math.round(p * 100) + "% action"));
      svg.append(rect);
    });
    if (j % 5 === 0) svg.append(el("text", { x: L - 6, y: T + (CVS.length - 1 - j) * CH + 11, "text-anchor": "end" }, Math.round(s * 100) + "%"));
  });
  const H = CVS.length * CH;
  MS.forEach((mm, i) => {
    if (mm % 20 === 0) svg.append(el("text", { x: L + i * CW + CW / 2, y: T + H + 16, "text-anchor": "middle" }, String(mm)));
  });
  const xl = L + MS.indexOf(AVG_LIMIT) * CW + CW / 2;
  svg.append(el("line", { x1: xl, x2: xl, y1: T - 2, y2: T + H + 2, stroke: c.ink, "stroke-width": 2 }));
  svg.append(el("text", { x: xl, y: T - 14, "text-anchor": "middle", style: "fill:" + c.ink }, "limit 60"));
  svg.append(el("text", { x: L + (MS.length * CW) / 2, y: T + H + 48, "text-anchor": "middle" }, "fragments per 100 g, lot average"));
  svg.append(el("text", { x: 0, y: T - 14 }, "patchiness"));

  const lx = L + MS.length * CW + 18;
  [0, 0.25, 0.5, 0.75, 1].forEach((p, k) => {
    svg.append(el("rect", { x: lx, y: T + k * 28, width: 14, height: 14, fill: c.stamp, "fill-opacity": shade(p) }));
    svg.append(el("text", { x: lx + 20, y: T + k * 28 + 11 }, Math.round(p * 100) + "%"));
  });

  // The reader's lot, placed between cells when its average is not a multiple of 4.
  const cx = L + (m / 4) * CW + CW / 2 - 0.5;
  const cy = T + (CVS.length - 1 - Math.round(cv * 10)) * CH + CH / 2 - 0.5;
  svg.append(el("circle", { cx, cy, r: 9, fill: "none", stroke: c.pen, "stroke-width": 3 }));
}

$("m").addEventListener("input", () => { showControls(); if (grid) drawMap(); });
$("cv").addEventListener("input", () => { showControls(); if (grid) drawMap(); });
$("one").addEventListener("click", takeOne);
$("many").addEventListener("click", takeMany);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (grid) drawMap(); if (last) { drawPieces(...last); drawStrip(...last); } });

showControls();
drawPieces(null);
drawStrip(null);
computeGrid();
drawMap();
takeOne();
