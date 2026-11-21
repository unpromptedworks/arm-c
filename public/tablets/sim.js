// Two tests for one tablet: run USP 23's content uniformity test (1995) and
// the harmonized USP <905> acceptance-value test on the same 30 tablets.
"use strict";

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

function normal() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

// Standard normal distribution function (Abramowitz and Stegun 7.1.26 via erf).
function Phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}
const tail = (mu, s) => Phi((85 - mu) / s) + 1 - Phi((115 - mu) / s);

const mean = (a) => a.reduce((p, c) => p + c, 0) / a.length;
const sdev = (a) => { const m = mean(a); return Math.sqrt(a.reduce((p, c) => p + (c - m) ** 2, 0) / (a.length - 1)); };
const ref = (m) => Math.min(101.5, Math.max(98.5, m)); // M, for a target of 100%
const accept = (y, k) => { const m = mean(y); return Math.abs(ref(m) - m) + k * sdev(y); };

// Harmonized test: AV of 10 <= 15.0; else AV of 30 (k = 2.0) <= 15.0 and every
// tablet within 25% of M.
function harmonized(x) {
  const y = x.slice(0, 10);
  const av10 = accept(y, 2.4);
  if (av10 <= 15) return { pass: true, stage: 1, av10 };
  const M = ref(mean(x));
  const av30 = accept(x, 2.0);
  const far = x.filter((v) => v < 0.75 * M || v > 1.25 * M).length;
  return { pass: av30 <= 15 && far === 0, stage: 2, av10, av30, far };
}

// USP 23, compressed tablets: 10 within 85-115 and RSD <= 6.0; one stray (none
// past 75-125) or RSD > 6.0 sends it to 30, where at most 1 stray, none past
// 75-125, and RSD <= 7.8.
function usp23(x) {
  const y = x.slice(0, 10);
  const out = (a) => a.filter((v) => v < 85 || v > 115).length;
  const far = (a) => a.filter((v) => v < 75 || v > 125).length;
  const rsd = (a) => (100 * sdev(a)) / mean(a);
  const o10 = out(y), f10 = far(y), r10 = rsd(y);
  if (o10 === 0 && r10 <= 6) return { pass: true, stage: 1, o10, r10 };
  if (o10 > 1 || f10 > 0) return { pass: false, stage: 1, o10, f10, r10 };
  const o30 = out(x), f30 = far(x), r30 = rsd(x);
  return { pass: o30 <= 1 && f30 === 0 && r30 <= 7.8, stage: 2, o10, r10, o30, f30, r30 };
}

// Box 8, from the same tests at a fixed seed (20,000 batches per trial):
// aim, widest scatter passing 99 in 100 under USP 23, under the harmonized test.
const EDGE = [
  [86, 0.4, 0.91], [87, 0.81, 1.27], [88, 1.22, 1.64], [89, 1.62, 2.01], [90, 2.03, 2.38],
  [91, 2.44, 2.75], [92, 2.85, 3.12], [93, 3.26, 3.49], [94, 3.66, 3.86], [95, 4.05, 4.23],
  [96, 4.44, 4.6], [97, 4.83, 4.97], [98, 5.16, 5.34], [98.5, 5.3, 5.51], [99, 5.39, 5.63],
  [100, 5.45, 5.71], [101, 5.41, 5.63], [101.5, 5.32, 5.51], [102, 5.18, 5.34], [103, 4.83, 4.99],
  [104, 4.44, 4.62],
];

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
// Each figure is drawn in its own pixel width, so its text keeps its size on a phone.
function canvas(id, h) {
  const svg = $(id);
  const w = Math.max(280, Math.round(svg.parentNode.clientWidth));
  svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.replaceChildren();
  return w;
}

const pct = (x, d = 1) => x.toFixed(d) + "%";
const state = () => ({ aim: +$("aim").value, sd: +$("sd").value });

function showControls() {
  const { aim, sd } = state();
  $("aimOut").textContent = pct(aim);
  $("sdOut").textContent = pct(sd);
  const t = tail(aim, sd) * 1000;
  $("tailOut").innerHTML = "Your press puts <b class=\"pen mono\">" + (t < 0.05 ? "under 0.1" : t < 10 ? t.toFixed(1) : Math.round(t)) +
    "</b> tablets in 1,000 outside 85&ndash;115% of the label.";
  $("manyOut").textContent = "";
}

// Strip: 70 to 130 percent of label. First ten on the upper row, next twenty below.
function drawStrip(x) {
  const c = colors();
  const H = 190;
  const W = canvas("strip", H);
  const svg = $("strip");
  const L = 14, R = W - 14;
  const xs = (v) => L + ((Math.min(Math.max(v, 70), 130) - 70) / 60) * (R - L);
  const row1 = 52, row2 = 112, base = 140;
  const band = (a, b, op) => svg.append(el("rect", { x: xs(a), y: 26, width: xs(b) - xs(a), height: base - 26, fill: c.stamp, opacity: op }));
  band(70, 75, 0.16); band(125, 130, 0.16); band(75, 85, 0.07); band(115, 125, 0.07);
  svg.append(el("line", { x1: L, x2: R, y1: base, y2: base, stroke: c.ink }));
  const narrow = W < 460;
  for (let g = 70; g <= 130; g += 5) {
    const major = g % 15 === 10 || g === 100 || g === 70 || g === 130;
    svg.append(el("line", { x1: xs(g), x2: xs(g), y1: base, y2: base + (g % 10 ? 4 : 7), stroke: c.ink }));
    if ([75, 85, 100, 115, 125].includes(g) || (!narrow && (g === 70 || g === 130)))
      svg.append(el("text", { x: xs(g), y: base + 20, "text-anchor": "middle" }, String(g)));
    void major;
  }
  svg.append(el("text", { x: R, y: base + 40, "text-anchor": "end" }, "% of label claim"));
  for (const e of [85, 115]) svg.append(el("line", { x1: xs(e), x2: xs(e), y1: 22, y2: base, stroke: c.stamp, "stroke-width": 2 }));
  for (const e of [75, 125]) svg.append(el("line", { x1: xs(e), x2: xs(e), y1: 22, y2: base, stroke: c.stamp, "stroke-width": 1, "stroke-dasharray": "3 3" }));
  svg.append(el("line", { x1: xs(100), x2: xs(100), y1: 22, y2: base, stroke: c.ink, "stroke-dasharray": "2 3" }));
  svg.append(el("text", { x: xs(100), y: 16, "text-anchor": "middle", style: "fill:" + c.ink }, "label"));
  if (!x) return;
  const place = (vals, y0, filled) => {
    const bins = new Map();
    for (const v of [...vals].sort((a, b) => a - b)) {
      const b = Math.round(xs(v) / 8);
      const k = bins.get(b) || 0;
      bins.set(b, k + 1);
      const stray = v < 85 || v > 115;
      svg.append(el("circle", {
        cx: (b * 8).toFixed(1), cy: y0 + (k % 3) * 8 - 8, r: 3.4,
        fill: stray ? c.stamp : filled ? c.pen : "none", stroke: stray ? c.stamp : c.pen, "stroke-width": 1.5,
      }));
    }
  };
  place(x.slice(0, 10), row1, true);
  place(x.slice(10), row2, false);
}

const n1 = (v) => v.toFixed(1);
function showVerdicts(x) {
  const o = usp23(x), h = harmonized(x);
  const set = (id, pass) => { const s = $(id); s.className = "stamp " + (pass ? "pass" : "fail"); s.textContent = pass ? "Meets" : "Fails"; };
  set("stOld", o.pass); set("stNew", h.pass);
  let wo;
  if (o.stage === 1 && o.pass) wo = "All 10 within 85–115%; RSD " + pct(o.r10) + ". Passed on the first 10.";
  else if (o.stage === 1) wo = o.f10 ? o.f10 + " of the first 10 outside 75–125%. Failed at once." : o.o10 + " of the first 10 outside 85–115%. Failed at once.";
  else wo = "First 10: " + o.o10 + " outside 85–115%, RSD " + pct(o.r10) + ", so 20 more. All 30: " + o.o30 + " outside 85–115% (1 allowed), " +
    o.f30 + " outside 75–125%, RSD " + pct(o.r30) + " (7.8% allowed).";
  let wn;
  if (h.stage === 1) wn = "AV of the first 10: " + n1(h.av10) + ". Passed on the first 10.";
  else wn = "AV of the first 10: " + n1(h.av10) + ", over 15.0, so 20 more. AV of all 30: " + n1(h.av30) + (h.far ? "; " + h.far + " more than 25% from M." : "; none more than 25% from M.");
  const strays = x.filter((v) => v < 85 || v > 115).length;
  if (h.pass && strays) wn += " " + strays + (strays === 1 ? " tablet is" : " tablets are") + " outside 85–115%; this test does not count them.";
  $("whyOld").textContent = wo;
  $("whyNew").textContent = wn;
}

function sample(aim, sd) {
  const x = [];
  for (let i = 0; i < 30; i++) x.push(aim + sd * normal());
  return x;
}

let last = null;
function sampleOne() {
  const { aim, sd } = state();
  last = sample(aim, sd);
  drawStrip(last);
  showVerdicts(last);
}

function sampleMany() {
  const { aim, sd } = state();
  let po = 0, pn = 0, both = 0;
  for (let k = 0; k < 1000; k++) {
    const x = sample(aim, sd);
    const a = usp23(x).pass, b = harmonized(x).pass;
    po += a; pn += b; both += a && b;
  }
  const f = (n) => n.toLocaleString("en-US");
  $("manyOut").innerHTML = "Of 1,000 batches, the 1995 test passed <b class=\"mono\">" + f(po) + "</b> and the harmonized test <b class=\"mono\">" + f(pn) +
    "</b>. They agreed on " + f(both + (1000 - po - pn + both)) + ".";
}

// Box 7: share outside 85-115 at each test's 99-in-100 edge, by aim.
function drawEdge() {
  const c = colors();
  const H = 300;
  const W = canvas("edge", H);
  const svg = $("edge");
  const L = 46, R = W - 16, T = 20, B = H - 54;
  const X0 = 86, X1 = 104, YMAX = 4;
  const xs = (a) => L + ((a - X0) / (X1 - X0)) * (R - L);
  const ys = (p) => B - (Math.min(p, YMAX) / YMAX) * (B - T);
  for (let p = 0; p <= YMAX; p += 1) {
    svg.append(el("line", { x1: L, x2: R, y1: ys(p), y2: ys(p), stroke: c.hair }));
    svg.append(el("text", { x: L - 6, y: ys(p) + 4, "text-anchor": "end" }, p + "%"));
  }
  const step = W < 460 ? 4 : 2;
  for (let a = X0; a <= X1; a += step) {
    svg.append(el("line", { x1: xs(a), x2: xs(a), y1: B, y2: B + 5, stroke: c.ink }));
    svg.append(el("text", { x: xs(a), y: B + 20, "text-anchor": "middle" }, String(a)));
  }
  svg.append(el("line", { x1: L, x2: R, y1: B, y2: B, stroke: c.ink }));
  svg.append(el("text", { x: (L + R) / 2, y: B + 42, "text-anchor": "middle" }, "aim, % of label"));
  // The Assay's usual 90-110 window, as a pale band.
  svg.append(el("rect", { x: xs(90), y: T, width: xs(104) - xs(90), height: B - T, fill: c.tint }));
  svg.append(el("text", { x: R - 4, y: B - 8, "text-anchor": "end" }, "Assay 90–110% →"));
  for (let p = 0; p <= YMAX; p += 1) svg.append(el("line", { x1: L, x2: R, y1: ys(p), y2: ys(p), stroke: c.hair, opacity: 0.6 }));
  // Each line stops where it leaves the chart, with an arrow and its value at 86.
  const pts = (i) => EDGE.map(([a, ...s]) => [a, 100 * tail(a, s[i])]);
  const line = (i) => {
    const q = pts(i);
    let k = q.findIndex(([, p]) => p <= YMAX);
    const out = [];
    if (k > 0) {
      const [a0, p0] = q[k - 1], [a1, p1] = q[k];
      out.push([a0 + ((p0 - YMAX) / (p0 - p1)) * (a1 - a0), YMAX]);
    }
    for (; k < q.length; k++) out.push(q[k]);
    return out;
  };
  const path = (q) => q.map(([a, p], k) => (k ? "L" : "M") + xs(a).toFixed(1) + " " + ys(p).toFixed(1)).join(" ");
  svg.append(el("path", { d: path(line(0)), fill: "none", stroke: c.ink, "stroke-width": 2, "stroke-dasharray": "6 4" }));
  const hq = line(1);
  svg.append(el("path", { d: path(hq), fill: "none", stroke: c.ink, "stroke-width": 2.5 }));
  const [ca] = hq[0];
  svg.append(el("path", { d: "M" + (xs(ca) - 5) + " " + (T + 6) + " L" + xs(ca) + " " + (T - 2) + " L" + (xs(ca) + 5) + " " + (T + 6), fill: "none", stroke: c.stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(ca) + 9, y: T + 12, style: "fill:" + c.stamp }, "off the chart: 13.6% at 86"));
  svg.append(el("text", { x: xs(97), y: ys(1.05) - 8, "text-anchor": "middle", style: "fill:" + c.ink }, "harmonized"));
  svg.append(el("text", { x: xs(93), y: ys(0.71) + 18, "text-anchor": "middle", style: "fill:" + c.ink }, "1995"));
  const { aim, sd } = state();
  const p = 100 * tail(aim, sd);
  if (aim >= X0 && aim <= X1) {
    const off = p > YMAX;
    svg.append(el("circle", { cx: xs(aim), cy: ys(p), r: 7, fill: "none", stroke: c.pen, "stroke-width": 3 }));
    if (off) svg.append(el("text", { x: xs(aim), y: ys(YMAX) - 10, "text-anchor": "middle", style: "fill:" + c.pen }, "↑ " + p.toFixed(1) + "%"));
  }
}

function refresh() {
  showControls();
  drawEdge();
  sampleOne();
}

for (const id of ["aim", "sd"]) $(id).addEventListener("input", refresh);
$("one").addEventListener("click", sampleOne);
$("many").addEventListener("click", sampleMany);
const redraw = () => { drawEdge(); drawStrip(last); };
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redraw);
let rt = 0;
addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });

refresh();
