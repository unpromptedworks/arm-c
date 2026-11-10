// The lopsided meter: drive a fleet's taximeters over a measured mile and
// apply the distance tolerances of NIST Handbook 44 (2026), 5.54, T.1.1.
"use strict";

const OVER = 1;               // % allowed on overregistration
const UNDER = 4;              // % allowed on underregistration
const EXTRA = 100 / 5280 * 100; // 100 ft on a one-mile test, as %: 1.894

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

// The window, in % of the test mile: [lo, hi].
function windowFor(rule, initial) {
  const lo = -(UNDER + (initial ? EXTRA : 0));
  if (rule === "mid") { const h = (OVER - lo) / 2; return [-h, h]; }
  return [lo, OVER];
}

function state() {
  const rule = document.querySelector('input[name="rule"]:checked').value;
  const initial = $("initial").checked;
  const [lo, hi] = windowFor(rule, initial);
  const other = windowFor(rule === "mid" ? "hb44" : "mid", initial);
  return { aim: +$("aim").value, sd: +$("sd").value, rule, initial, lo, hi, other };
}

const passChance = (aim, sd, lo, hi) => Phi((hi - aim) / sd) - Phi((lo - aim) / sd);

// Fastest aim that passes 99 in 100, or NaN if none does.
function topAim(sd, lo, hi) {
  let a = (lo + hi) / 2, b = hi;
  if (passChance(a, sd, lo, hi) < 0.99) return NaN;
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2;
    if (passChance(m, sd, lo, hi) >= 0.99) a = m; else b = m;
  }
  return a;
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
  return { ink: v("--ink"), hair: v("--hair"), pen: v("--pen"), stamp: v("--stamp"), muted: v("--muted"), pass: v("--pass") };
}

const sign = (x) => (x > 0.00001 ? "+" : x < -0.00001 ? "−" : "");
const pct = (x, d = 2) => sign(x) + Math.abs(x).toFixed(d) + "%";

function showControls() {
  const s = state();
  $("aimOut").textContent = pct(s.aim);
  $("sdOut").textContent = s.sd.toFixed(2) + "%";
  const hb = windowFor("hb44", s.initial), mid = windowFor("mid", s.initial);
  $("winHb").textContent = pct(hb[0]) + " to +1%";
  $("winMid").textContent = "±" + mid[1].toFixed(2) + "%";
  $("manyOut").textContent = "";
}

// Strip: registered distance on the measured mile.
const LO = 0.92, HI = 1.03, W = 600, BASE = 150;
const xs = (mi) => 20 + ((Math.min(Math.max(mi, LO), HI) - LO) / (HI - LO)) * (W - 40);

function drawStrip(errs) {
  const svg = $("taxistrip");
  svg.replaceChildren();
  const c = colors();
  const { lo, hi } = state();
  const a = 1 + lo / 100, b = 1 + hi / 100;
  svg.append(el("rect", { x: xs(LO), y: 26, width: xs(a) - xs(LO), height: BASE - 26, fill: c.stamp, opacity: 0.08 }));
  svg.append(el("rect", { x: xs(b), y: 26, width: xs(HI) - xs(b), height: BASE - 26, fill: c.stamp, opacity: 0.08 }));
  svg.append(el("line", { x1: 20, x2: W - 20, y1: BASE, y2: BASE, stroke: c.ink }));
  for (let k = 0; k <= 11; k++) {
    const g = LO + k * 0.01;
    const major = k % 2 === 0;
    svg.append(el("line", { x1: xs(g), x2: xs(g), y1: BASE, y2: BASE + (major ? 7 : 4), stroke: c.ink }));
    if (k % 4 === 0) svg.append(el("text", { x: xs(g), y: BASE + 24, "text-anchor": k ? "middle" : "start" }, g.toFixed(2)));
  }
  svg.append(el("text", { x: W - 20, y: BASE + 50, "text-anchor": "end" }, "miles registered"));
  for (const e of [a, b]) svg.append(el("line", { x1: xs(e), x2: xs(e), y1: 22, y2: BASE, stroke: c.stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(a) + 4, y: 18, style: "fill:" + c.stamp }, "short " + pct(lo)));
  svg.append(el("text", { x: xs(b) + 4, y: 18, style: "fill:" + c.stamp }, "long " + pct(hi, hi % 1 ? 2 : 0)));
  svg.append(el("line", { x1: xs(1), x2: xs(1), y1: 22, y2: BASE, stroke: c.ink, "stroke-dasharray": "2 3" }));
  if (!errs) return;
  const one = errs.length === 1;
  const step = one ? 14 : 5;
  const counts = new Map();
  for (const e of errs) { const bin = Math.round(xs(1 + e / 100) / step); counts.set(bin, (counts.get(bin) || 0) + 1); }
  const tallest = Math.max(...counts.values());
  const room = BASE - 30;
  const pitch = one ? 13 : Math.min(5.4, room / tallest);
  const r = one ? 6 : Math.max(0.8, Math.min(2.2, pitch / 2 - 0.3));
  const bins = new Map();
  for (const e of errs) {
    const bin = Math.round(xs(1 + e / 100) / step);
    const k = bins.get(bin) || 0;
    bins.set(bin, k + 1);
    const bad = e < lo || e > hi;
    svg.append(el("circle", {
      cx: (bin * step).toFixed(1), cy: (BASE - r - 4 - k * pitch).toFixed(1), r: r.toFixed(2),
      fill: bad ? c.stamp : "none", stroke: bad ? c.stamp : c.pen, "stroke-width": one ? 1.5 : Math.min(1.2, r * 0.6),
    }));
  }
}

function showOne(e) {
  const { lo, hi } = state();
  const pass = e >= lo && e <= hi;
  const mag = Math.abs(e).toFixed(2) + "%";
  $("fReg").textContent = (1 + e / 100).toFixed(4) + " mi";
  $("fErr").textContent = pct(e);
  $("fFare").textContent = Math.abs(e) < 0.005 ? "$0.00" : (e >= 0 ? "+$" : "−$") + Math.abs(e).toFixed(2);
  const st = $("stamp");
  st.className = "stamp " + (pass ? "pass" : "fail");
  st.textContent = pass ? "Passed" : "Rejected";
  let why;
  if (Math.abs(e) < 0.005) why = "On the mark: the meter registered the mile.";
  else if (pass) why = e > 0 ? "Long by " + mag + ": the passenger pays for distance the cab did not drive, and the code allows it." : "Short by " + mag + ": the passenger rides that distance free.";
  else why = e > hi ? "Long by " + mag + ", past the " + Math.abs(hi).toFixed(hi % 1 ? 2 : 0) + "% edge." : "Short by " + mag + ", past the " + Math.abs(lo).toFixed(2) + "% edge.";
  $("reason").textContent = why;
}

function testOne() {
  const { aim, sd } = state();
  const e = aim + sd * normal();
  drawStrip([e]);
  showOne(e);
}

function testMany() {
  const { aim, sd, lo, hi } = state();
  const errs = [];
  let fast = 0, slow = 0, sum = 0;
  for (let k = 0; k < 1000; k++) {
    const e = aim + sd * normal();
    errs.push(e);
    sum += e;
    if (e > hi) fast++; else if (e < lo) slow++;
  }
  drawStrip(errs);
  const mean = sum / 1000;
  $("fReg").textContent = (1 + mean / 100).toFixed(4) + " mi avg";
  $("fErr").textContent = pct(mean) + " avg";
  $("fFare").textContent = (mean >= 0 ? "+$" : "−$") + Math.abs(mean).toFixed(2) + " avg";
  const st = $("stamp");
  const failed = fast + slow;
  st.className = "stamp " + (failed <= 10 ? "pass" : "fail");
  st.textContent = (1000 - failed) + " passed";
  $("reason").textContent = "";
  $("manyOut").textContent = failed + " of 1,000 rejected: " + fast + " for reading long, " + slow + " for reading short. Exact chance a cab fails: " + ((1 - passChance(aim, sd, lo, hi)) * 100).toFixed(1) + "%.";
}

// Map: fastest aim passing 99 in 100, by scatter, for both windows.
const MX0 = 0.1, MX1 = 1.5, MY0 = -4, MY1 = 4;
const L = 80, R = 600, T = 24, B = 330;
const mx = (s) => L + ((s - MX0) / (MX1 - MX0)) * (R - L);
const my = (a) => B - ((Math.min(Math.max(a, MY0), MY1) - MY0) / (MY1 - MY0)) * (B - T);

function curve(lo, hi) {
  const pts = [];
  for (let s = MX0; s <= MX1 + 1e-9; s += 0.01) {
    const a = topAim(s, lo, hi);
    if (Number.isNaN(a)) break;
    pts.push([mx(s), my(a)]);
  }
  return pts;
}

function drawMap() {
  const svg = $("fleet");
  svg.replaceChildren();
  const c = colors();
  const { aim, sd, lo, hi, other } = state();
  for (let a = MY0; a <= MY1; a += 1) {
    svg.append(el("line", { x1: L, x2: R, y1: my(a), y2: my(a), stroke: c.hair, "stroke-dasharray": a === 0 ? "" : "1 0" }));
    svg.append(el("text", { x: L - 8, y: my(a) + 4, "text-anchor": "end" }, (a > 0 ? "+" : a < 0 ? "−" : "") + Math.abs(a) + "%"));
  }
  svg.append(el("line", { x1: L, x2: R, y1: my(0), y2: my(0), stroke: c.ink, "stroke-dasharray": "2 3" }));
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  const tick = narrow ? 0.5 : 0.25;
  for (let s = tick; s <= MX1 + 1e-9; s += tick) {
    svg.append(el("line", { x1: mx(s), x2: mx(s), y1: B, y2: B + 6, stroke: c.ink }));
    svg.append(el("text", { x: mx(s), y: B + 22, "text-anchor": s > MX1 - 0.01 ? "end" : "middle" }, s.toFixed(2) + "%"));
  }
  svg.append(el("line", { x1: L, x2: R, y1: B, y2: B, stroke: c.ink }));
  svg.append(el("text", { x: R, y: B + 44, "text-anchor": "end" }, "scatter, cab to cab"));
  svg.append(el("text", { x: L, y: T - 6 }, "aim"));
  svg.append(el("text", { x: R - 4, y: my(0) + 20, "text-anchor": "end", style: "fill:" + c.ink }, "true distance"));
  svg.append(el("text", { x: L + 8, y: my(-3.5) }, "below it: passenger pays less"));

  const path = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const mine = curve(lo, hi), theirs = curve(other[0], other[1]);
  // Shade the failing region above the chosen curve.
  if (mine.length) {
    const last = mine[mine.length - 1];
    const d = path(mine) + " L" + last[0].toFixed(1) + " " + T + " L" + mine[0][0].toFixed(1) + " " + T + " Z";
    svg.append(el("path", { d, fill: c.stamp, opacity: 0.08 }));
    if (last[0] < R) svg.append(el("rect", { x: last[0], y: T, width: R - last[0], height: B - T, fill: c.stamp, opacity: 0.08 }));
  }
  svg.append(el("path", { d: path(theirs), fill: "none", stroke: c.muted, "stroke-width": 1.5, "stroke-dasharray": "6 4" }));
  svg.append(el("path", { d: path(mine), fill: "none", stroke: c.stamp, "stroke-width": 2.5 }));
  svg.append(el("text", { x: R - 4, y: T + 20, "text-anchor": "end", style: "fill:" + c.stamp }, "above: over 1 in 100 fail"));
  // Name the dashed curve where it is, a little above it.
  if (theirs.length > 40) {
    const q = theirs[Math.floor(theirs.length * 0.55)];
    svg.append(el("text", { x: q[0] + 6, y: q[1] - 12 }, (state().rule === "mid" ? "as written" : "centred window")));
  }
  // Where the chosen curve crosses zero.
  const z = mine.find((p) => p[1] >= my(0));
  if (z) {
    svg.append(el("circle", { cx: z[0], cy: my(0), r: 3.5, fill: c.stamp }));
    svg.append(el("text", { x: z[0], y: my(0) + 26, "text-anchor": "middle", style: "fill:" + c.stamp }, "" + ((z[0] - L) / (R - L) * (MX1 - MX0) + MX0).toFixed(2) + "%"));
  }
  // The reader's fleet.
  const ok = passChance(aim, sd, lo, hi) >= 0.99;
  svg.append(el("circle", { cx: mx(sd), cy: my(aim), r: 7, fill: "none", stroke: ok ? c.pen : c.stamp, "stroke-width": 2.5 }));
  // Label the ring on the side away from the curve, inside the plot.
  const top = topAim(sd, lo, hi);
  let ly = !Number.isNaN(top) && aim < top ? my(aim) + 30 : my(aim) - 16;
  if (ly > B - 6) ly = my(aim) - 16;
  if (ly < T + 30) ly = my(aim) + 30;
  const lx = Math.min(Math.max(mx(sd), L + 70), R - 70);
  svg.append(el("text", { x: lx, y: ly, "text-anchor": "middle", style: "fill:" + c.pen + ";font-weight:700" }, "your fleet"));
}

function update() {
  showControls();
  drawStrip(null);
  drawMap();
  $("fReg").textContent = $("fErr").textContent = $("fFare").textContent = "—";
  const st = $("stamp");
  st.className = "stamp idle";
  st.textContent = "Not tested";
  const { aim, sd, lo, hi } = state();
  $("reason").textContent = "Chance a cab fails: " + ((1 - passChance(aim, sd, lo, hi)) * 100).toFixed(1) + "%.";
}

for (const id of ["aim", "sd", "initial"]) $(id).addEventListener("input", update);
for (const r of document.querySelectorAll('input[name="rule"]')) r.addEventListener("change", update);
$("one").addEventListener("click", testOne);
$("many").addEventListener("click", testMany);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", update);
window.matchMedia("(max-width: 720px)").addEventListener("change", update);
update();
