// The coin remedy: strike ten new pence coins and weigh a kilogram of them in
// bulk, as the Coinage Act 1971, s. 1(3), measures the remedy.
"use strict";

const STD = 11.31036; // standard weight, grams (Sch. 1, Part II)
const REM = 64.6;     // remedy, milligrams (0.0646 g)
const MAXN = 88;      // most coins that weigh not more than one kilogram

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

function state() {
  const n = +$("n").value;
  const root = document.querySelector('input[name="rule"]:checked').value === "root";
  return { aim: +$("aim").value, sd: +$("sd").value, n, limit: root ? REM / Math.sqrt(n) : REM, root };
}

// Variations of each coin from the standard, in milligrams.
function strike(aim, sd, n) {
  const v = [];
  for (let i = 0; i < n; i++) v.push(aim + sd * normal());
  return v;
}

function weigh(v, limit) {
  const avg = v.reduce((a, b) => a + b, 0) / v.length;
  const out = v.filter((x) => Math.abs(x) > REM).length;
  return { avg, out, n: v.length, weight: v.length * STD + (avg * v.length) / 1000, pass: Math.abs(avg) <= limit };
}

// Exact chance the bulk test fails, and the share of coins outside the remedy.
function failChance(aim, sd, n, limit) {
  const s = sd / Math.sqrt(n);
  return 1 - (Phi((limit - aim) / s) - Phi((-limit - aim) / s));
}
function outShare(aim, sd) {
  return Phi((-REM - aim) / sd) + 1 - Phi((REM - aim) / sd);
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

const mg = (x) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(Math.abs(x) < 10 ? 1 : 0) + " mg";

function showControls() {
  const { aim, sd, n, limit } = state();
  $("aimOut").textContent = mg(aim);
  $("sdOut").textContent = sd + " mg";
  $("nOut").textContent = String(n);
  $("nRoot").textContent = String(n);
  $("scaled").textContent = (REM / Math.sqrt(n)).toFixed(1);
  $("manyOut").textContent = "";
}

// Strip: every coin's variation, stacked where they crowd, with the remedy band.
const LO = -150, HI = 100, W = 600;
const xs = (d) => 20 + ((Math.min(Math.max(d, LO), HI) - LO) / (HI - LO)) * (W - 40);

function drawStrip(v, r) {
  const svg = $("strip");
  svg.replaceChildren();
  const c = colors();
  const { limit } = state();
  const base = 150;
  svg.append(el("rect", { x: xs(LO), y: 24, width: xs(-REM) - xs(LO), height: base - 24, fill: c.stamp, opacity: 0.08 }));
  svg.append(el("rect", { x: xs(REM), y: 24, width: xs(HI) - xs(REM), height: base - 24, fill: c.stamp, opacity: 0.08 }));
  svg.append(el("line", { x1: 20, x2: W - 20, y1: base, y2: base, stroke: c.ink }));
  for (let g = LO; g <= HI; g += 10) {
    svg.append(el("line", { x1: xs(g), x2: xs(g), y1: base, y2: base + (g % 50 ? 4 : 7), stroke: c.ink }));
    if (g % 50 === 0) svg.append(el("text", { x: xs(g), y: base + 20, "text-anchor": "middle" }, g > 0 ? "+" + g : String(g).replace("-", "−")));
  }
  svg.append(el("text", { x: W - 20, y: base + 38, "text-anchor": "end" }, "mg from 11.31036 g"));
  for (const e of [-REM, REM]) svg.append(el("line", { x1: xs(e), x2: xs(e), y1: 20, y2: base, stroke: c.stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(-REM) - 4, y: 16, "text-anchor": "end", style: "fill:" + c.stamp }, "remedy −64.6"));
  svg.append(el("text", { x: xs(REM) + 4, y: 16, style: "fill:" + c.stamp }, "+64.6"));
  svg.append(el("line", { x1: xs(0), x2: xs(0), y1: 20, y2: base, stroke: c.ink, "stroke-dasharray": "2 3" }));
  // The average's permitted band, under the axis.
  svg.append(el("rect", { x: xs(-limit), y: base - 5, width: xs(limit) - xs(-limit), height: 10, fill: "none", stroke: c.stamp, "stroke-width": 1.5 }));
  if (!v) return;
  const bins = new Map();
  for (const d of [...v].sort((a, b) => a - b)) {
    const b = Math.round(xs(d) / 7);
    const k = bins.get(b) || 0;
    bins.set(b, k + 1);
    const hot = Math.abs(d) > REM;
    svg.append(el("circle", {
      cx: (b * 7).toFixed(1), cy: base - 12 - (k % 16) * 7, r: 3,
      fill: hot ? c.stamp : "none", stroke: hot ? c.stamp : c.pen, "stroke-width": 1.5,
    }));
  }
  const ax = xs(r.avg);
  svg.append(el("line", { x1: ax, x2: ax, y1: base - 14, y2: base + 10, stroke: c.pen, "stroke-width": 4 }));
  svg.append(el("text", { x: ax, y: base + 38, "text-anchor": "middle", style: "fill:" + c.pen + ";font-weight:700" }, "avg"));
}

function showResult(r) {
  const { limit, root } = state();
  $("fW").textContent = r.weight.toFixed(2) + " g";
  $("fAvg").textContent = mg(r.avg);
  $("fOut").textContent = r.out + " of " + r.n;
  const st = $("stamp");
  st.className = "stamp " + (r.pass ? "pass" : "fail");
  st.textContent = r.pass ? "Within remedy" : "Outside remedy";
  const lim = (root ? "the scaled " : "the ") + limit.toFixed(1) + " mg";
  let why = "Average " + mg(r.avg) + " per coin, against " + lim + ".";
  if (r.pass && r.out) why += " " + r.out + (r.out === 1 ? " coin is" : " coins are") + " outside the remedy on its own; the bulk test does not look at them.";
  if (!r.pass && !r.out) why += " Not one coin is outside the remedy on its own.";
  $("reason").textContent = why;
}

let last = null;

function strikeOne() {
  const { aim, sd, n, limit } = state();
  const v = strike(aim, sd, n);
  const r = weigh(v, limit);
  last = [v, r];
  drawStrip(v, r);
  showResult(r);
}

function strikeMany() {
  const { aim, sd, n, limit } = state();
  let fail = 0, out = 0;
  for (let k = 0; k < 1000; k++) {
    const r = weigh(strike(aim, sd, n), limit);
    if (!r.pass) fail++;
    out += r.out;
  }
  const share = (out / (1000 * n)) * 100;
  $("manyOut").innerHTML = "Of 1,000 lots from your press, <b class=\"red mono\">" + fail.toLocaleString("en-US") +
    "</b> failed. Across all of them, " + share.toFixed(share < 10 ? 1 : 0) + "% of the coins were outside the remedy one by one.";
}

// Map: chance of failing, by aim and scatter, for the chosen n and rule.
const AIMS = [], SDS = [];
for (let a = -100; a <= 40; a += 5) AIMS.push(a);
for (let s = 5; s <= 60; s += 5) SDS.push(s);

function drawMap() {
  const svg = $("map");
  svg.replaceChildren();
  const c = colors();
  const { aim, sd, n, limit } = state();
  const L = 52, T = 36, CW = 19, CH = 17;
  const shade = (p) => (0.03 + 0.87 * p).toFixed(3);
  const H = SDS.length * CH;
  const cx = (a) => L + ((a - AIMS[0]) / 5) * CW + CW / 2;
  const cy = (s) => T + (SDS.length - 1 - (s - SDS[0]) / 5) * CH + CH / 2;

  SDS.forEach((s) => {
    AIMS.forEach((a) => {
      const p = failChance(a, s, n, limit);
      const rect = el("rect", { x: cx(a) - CW / 2, y: cy(s) - CH / 2, width: CW - 1, height: CH - 1, fill: c.stamp, "fill-opacity": shade(p) });
      rect.append(el("title", {}, "aim " + mg(a) + ", scatter " + s + " mg: " + Math.round(p * 100) + "% of lots fail; " +
        Math.round(outShare(a, s) * 100) + "% of coins outside the remedy"));
      svg.append(rect);
    });
    if (s % 20 === 0 || s === 5) svg.append(el("text", { x: L - 6, y: cy(s) + 4, "text-anchor": "end" }, String(s)));
  });
  AIMS.forEach((a) => {
    if (a % 50 === 0) svg.append(el("text", { x: cx(a), y: T + H + 24, "text-anchor": "middle" }, a > 0 ? "+" + a : String(a).replace("-", "−")));
  });
  const x0 = cx(0);
  svg.append(el("line", { x1: x0, x2: x0, y1: T - 2, y2: T + H + 2, stroke: c.ink, "stroke-dasharray": "2 3" }));
  svg.append(el("text", { x: x0, y: T - 12, "text-anchor": "middle", style: "fill:" + c.ink }, "standard"));
  svg.append(el("text", { x: L + (AIMS.length * CW) / 2, y: T + H + 50, "text-anchor": "middle" }, "aim, mg from the standard"));
  svg.append(el("text", { x: 0, y: T - 12 }, "scatter, mg"));

  // Curve where one coin in ten is outside the remedy: for each scatter,
  // the aims either side of the standard where outShare = 0.1.
  const edge = (s, sign) => {
    let lo = 0, hi = sign * 200;
    for (let k = 0; k < 40; k++) {
      const mid = (lo + hi) / 2;
      if (outShare(mid, s) < 0.1) lo = mid; else hi = mid;
    }
    return lo;
  };
  const pts = [];
  const xOf = (a) => cx(AIMS[0]) + ((a - AIMS[0]) / 5) * CW;
  const yOf = (s) => cy(SDS[0]) - ((s - SDS[0]) / 5) * CH;
  const smax = 60;
  for (let s = 5; s <= smax; s += 1) { if (outShare(0, s) >= 0.1) break; pts.push([edge(s, -1), s]); }
  const right = [];
  for (let s = 5; s <= smax; s += 1) { if (outShare(0, s) >= 0.1) break; right.push([edge(s, 1), s]); }
  const inside = ([a]) => a >= AIMS[0] - 2.5 && a <= AIMS[AIMS.length - 1] + 2.5;
  const path = pts.concat(right.reverse()).filter(inside).map(([a, s], i) => (i ? "L" : "M") + xOf(a).toFixed(1) + " " + yOf(s).toFixed(1)).join(" ");
  svg.append(el("path", { d: path, fill: "none", stroke: c.pen, "stroke-width": 2.5 }));

  // Legend in two rows under the axis title, so it fits at phone width.
  const ly = T + H + 70;
  [0, 0.5, 1].forEach((p, k) => {
    svg.append(el("rect", { x: L + k * 150, y: ly, width: 14, height: 14, fill: c.stamp, "fill-opacity": shade(p) }));
    svg.append(el("text", { x: L + k * 150 + 20, y: ly + 12 }, Math.round(p * 100) + "% fail"));
  });
  svg.append(el("line", { x1: L, x2: L + 14, y1: ly + 37, y2: ly + 37, stroke: c.pen, "stroke-width": 2.5 }));
  svg.append(el("text", { x: L + 20, y: ly + 42 }, "9 coins in 10 inside the remedy"));

  svg.append(el("circle", { cx: xOf(aim), cy: yOf(sd), r: 8, fill: "none", stroke: c.pen, "stroke-width": 3 }));
}

function refresh() {
  showControls();
  drawMap();
  strikeOne();
}

for (const id of ["aim", "sd", "n"]) $(id).addEventListener("input", refresh);
for (const r of document.querySelectorAll('input[name="rule"]')) r.addEventListener("change", () => {
  showControls();
  drawMap();
  if (last) { last[1] = weigh(last[0], state().limit); drawStrip(...last); showResult(last[1]); }
});
$("one").addEventListener("click", strikeOne);
$("many").addEventListener("click", strikeMany);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { drawMap(); if (last) drawStrip(...last); });

showControls();
drawStrip(null);
drawMap();
strikeOne();
