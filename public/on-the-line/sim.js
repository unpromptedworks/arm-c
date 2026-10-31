// On the line: the chance each worked entry's inspection passes a lot, drawn
// against how far the lot sits past the line its rule draws. One curve per
// rule (an operating characteristic curve), all three aligned at the line.
// The models are the ones on the entry pages: /short-fill/, /chocolate/, /pyx/.
"use strict";

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

// Seeded generator (mulberry32), so the curves are smooth and repeatable.
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function normalFrom(r) {
  let u = 0;
  while (u === 0) u = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}
function gammaFrom(r, k) {
  if (k < 1) return gammaFrom(r, k + 1) * Math.pow(r(), 1 / k);
  const d = k - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x, v;
    do { x = normalFrom(r); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    if (Math.log(r()) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
  }
}
// Poisson count by inversion of a given uniform, so one uniform per
// subsample serves every lot average on the curve.
function poissonInv(lambda, u) {
  if (lambda > 400) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * invPhi(u)));
  let k = 0, p = Math.exp(-lambda), cdf = p;
  while (cdf < u && k < 2000) { k++; p *= lambda / k; cdf += p; }
  return k;
}
function Phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}
function invPhi(p) {
  let lo = -9, hi = 9;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (Phi(m) < p) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

const RUNS = 4000;

// Entry 001. Lot passes if no jar is more than 19.9 g short and the sample
// average's shortfall is no more than 0.635 × the sample standard deviation.
// x = shortfall of the line's true average below 454 g.
const SF = (() => {
  const r = rng(1001), Z = [];
  for (let k = 0; k < RUNS; k++) { const z = []; for (let i = 0; i < 12; i++) z.push(normalFrom(r)); Z.push(z); }
  return {
    id: "sf", name: "Short fill", href: "/short-fill/", lo: -4, hi: 10, step: 0.25,
    lineLabel: "454 g average", unit: "g",
    axis: (x) => (454 - x).toFixed(0) + " g",
    tickStep: 2,
    past: (x) => x.toFixed(1) + " g short",
    pass(x, sd) {
      const mu = 454 - x;
      let p = 0;
      for (const z of Z) {
        let sum = 0, ume = false;
        const w = z.map((v) => { const j = mu + sd * v; sum += j; if (454 - j > 19.9) ume = true; return j; });
        if (ume) continue;
        const m = sum / 12;
        const s = Math.sqrt(w.reduce((a, j) => a + (j - m) ** 2, 0) / 11);
        if (m >= 454 || 454 - m <= 0.635 * s) p++;
      }
      return p / RUNS;
    },
  };
})();

// Entry 002. Lot escapes action if the six subsamples average under 60
// fragments per 100 g and none reaches 90. x = lot average minus 60.
const CH = (() => {
  const r = rng(2002), U = [];
  for (let k = 0; k < RUNS * 6; k++) U.push(r());
  let gcv = null, G = null;
  const gammas = (cv) => {
    if (cv === gcv) return G;
    const rg = rng(2003);
    G = [];
    for (let k = 0; k < RUNS * 6; k++) G.push(cv === 0 ? 1 : cv * cv * gammaFrom(rg, 1 / (cv * cv)));
    gcv = cv;
    return G;
  };
  return {
    id: "ch", name: "Insects in chocolate", href: "/chocolate/", lo: -18, hi: 42, step: 1.5,
    lineLabel: "60 per 100 g", unit: "",
    axis: (x) => String(Math.round(60 + x)),
    tickStep: 10,
    past: (x) => Math.round(60 + x) + " per 100 g",
    pass(x, cv) {
      const g = gammas(cv), m = 60 + x;
      let p = 0;
      for (let k = 0; k < RUNS; k++) {
        let sum = 0, hot = false;
        for (let i = 0; i < 6; i++) {
          const n = poissonInv(m * g[k * 6 + i], U[k * 6 + i]);
          sum += n; if (n >= 90) hot = true;
        }
        if (!hot && sum / 6 < 60) p++;
      }
      return p / RUNS;
    },
  };
})();

// Entry 003. A kilogram (88 coins) passes if its average variation is within
// 64.6 mg of the standard. x = how far the press's aim sits beyond the
// remedy, on the light side. Exact, from the normal distribution.
const PX = {
  id: "px", name: "Coin weight", href: "/pyx/", lo: -6, hi: 14, step: 0.25,
  lineLabel: "remedy, −64.6 mg", unit: "mg",
  axis: (x) => "−" + Math.round(64.6 + x),
  tickStep: 5,
  tickFrom: 0.4,
  past: (x) => "aim −" + (64.6 + x).toFixed(1) + " mg",
  pass(x, sd) {
    const a = -(64.6 + x), s = sd / Math.sqrt(88);
    return Phi((64.6 - a) / s) - Phi((-64.6 - a) / s);
  },
};

const ROWS = [
  { rule: SF, slider: "sfV", out: (v) => v.toFixed(1) + " g" },
  { rule: CH, slider: "chV", out: (v) => Math.round(v * 100) + "%" },
  { rule: PX, slider: "pxV", out: (v) => v + " mg" },
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
  return { paper: v("--paper"), ink: v("--ink"), hair: v("--hair"), pen: v("--pen"), stamp: v("--stamp"), muted: v("--muted"), tint: v("--tint"), pass: v("--pass") };
}

// The curve, made non-increasing (a lot further past the line never passes
// more often), and the two readings the ledger needs.
function curve(rule, v) {
  const pts = [];
  let run = 1;
  for (let x = rule.lo; x <= rule.hi + 1e-9; x += rule.step) {
    run = Math.min(run, rule.pass(x, v));
    pts.push([x, run]);
  }
  const atLine = rule.pass(0, v);
  let catch9 = null;
  for (let i = 1; i < pts.length; i++) {
    const [x0, p0] = pts[i - 1], [x1, p1] = pts[i];
    if (x1 > 0 && p0 > 0.1 && p1 <= 0.1) { catch9 = x0 + ((p0 - 0.1) / (p0 - p1)) * (x1 - x0); break; }
  }
  if (catch9 !== null && catch9 < 0) catch9 = null;
  return { pts, atLine, catch9 };
}

const W = 640, L = 46, R = 16, T = 16, H = 150, LINE_AT = 0.3;

function draw(row, res) {
  const { rule } = row;
  const svg = $(rule.id + "Svg");
  svg.replaceChildren();
  const c = colors();
  const span = W - L - R;
  // Each row's own units, with the line at the same place on every row.
  const k = Math.max(-rule.lo / LINE_AT, rule.hi / (1 - LINE_AT));
  const xs = (x) => L + span * (LINE_AT + x / k);
  const ys = (p) => T + H * (1 - p);
  const inX = (x) => xs(x) >= L - 0.5 && xs(x) <= W - R + 0.5;

  svg.append(el("rect", { x: xs(0), y: T, width: W - R - xs(0), height: H, fill: c.stamp, opacity: 0.06 }));
  for (const p of [0, 0.5, 1]) {
    svg.append(el("line", { x1: L, x2: W - R, y1: ys(p), y2: ys(p), stroke: p === 0 ? c.ink : c.hair }));
    svg.append(el("text", { x: L - 6, y: ys(p) + 4, "text-anchor": "end" }, Math.round(p * 100) + "%"));
  }
  svg.append(el("line", { x1: L, x2: W - R, y1: ys(0.1), y2: ys(0.1), stroke: c.hair, "stroke-dasharray": "2 3" }));
  svg.append(el("text", { x: W - R, y: ys(0.1) - 4, "text-anchor": "end" }, "10%"));

  const first = Math.ceil((rule.lo - (rule.tickFrom || 0)) / rule.tickStep) * rule.tickStep + (rule.tickFrom || 0);
  for (let x = first; x <= rule.hi + 1e-9; x += rule.tickStep) {
    if (!inX(x)) continue;
    svg.append(el("line", { x1: xs(x), x2: xs(x), y1: ys(0), y2: ys(0) + 5, stroke: c.ink }));
    svg.append(el("text", { x: xs(x), y: ys(0) + 19, "text-anchor": "middle" }, rule.axis(x)));
  }

  svg.append(el("line", { x1: xs(0), x2: xs(0), y1: T - 6, y2: ys(0), stroke: c.stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(0) + 5, y: T + 2, style: "fill:" + c.stamp }, "line: " + rule.lineLabel));

  const d = res.pts.map(([x, p], i) => (i ? "L" : "M") + xs(x).toFixed(1) + " " + ys(p).toFixed(1)).join(" ");
  svg.append(el("path", { d, fill: "none", stroke: c.pen, "stroke-width": 3 }));

  svg.append(el("circle", { cx: xs(0), cy: ys(res.atLine), r: 6, fill: c.paper, stroke: c.ink, "stroke-width": 2.5 }));
  if (res.catch9 !== null && inX(res.catch9)) {
    svg.append(el("line", { x1: xs(res.catch9), x2: xs(res.catch9), y1: ys(0.1), y2: ys(0), stroke: c.pen, "stroke-dasharray": "3 3" }));
  }
}

function pct(p) {
  if (p >= 0.995) return "more than 99%";
  if (p <= 0.005) return "less than 1%";
  if (p >= 0.9) return (p * 100).toFixed(1) + "%";
  return Math.round(p * 100) + "%";
}

function refreshRow(row) {
  const v = +$(row.slider).value;
  $(row.slider + "Out").textContent = row.out(v);
  const res = curve(row.rule, v);
  draw(row, res);
  const id = row.rule.id;
  $(id + "At").textContent = pct(res.atLine);
  $(id + "Catch").textContent = res.catch9 === null ? "beyond the chart" : row.rule.past(res.catch9);
  $("t" + id + "At").textContent = pct(res.atLine);
  $("t" + id + "Catch").textContent = res.catch9 === null ? "beyond the chart" : row.rule.past(res.catch9);
  $("t" + id + "V").textContent = row.out(v);
}

for (const row of ROWS) {
  let pending = 0;
  $(row.slider).addEventListener("input", () => {
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(() => refreshRow(row));
  });
  refreshRow(row);
}
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => ROWS.forEach(refreshRow));
