// Short fill: simulate a filling line and the NIST Handbook 133 Category A
// inspection for a 454 g label (lot of 12 to 250 packages).
"use strict";

const LABEL = 454;      // labeled net weight, g
const MAV = 19.9;       // Table 2-5, more than 426 g to 489 g
const N = 12;           // Table 2-1, lot size 12 to 250
const SCF = 0.635;      // Table 2-1, sample correction factor for n = 12
const UME_ALLOWED = 0;  // Table 2-1, column 4
const LOW = LABEL - MAV;

const $ = (id) => document.getElementById(id);
const NS = "http://www.w3.org/2000/svg";

function normal() {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}

function drawSample(mu, sd) {
  const jars = [];
  for (let i = 0; i < N; i++) jars.push(mu + sd * normal());
  return jars;
}

// The worksheet: Boxes 16, 18, 21 and 23, and the verdict.
function inspect(jars) {
  const ume = jars.filter((w) => LABEL - w > MAV).length;
  const mean = jars.reduce((a, b) => a + b, 0) / jars.length;
  const ss = jars.reduce((a, w) => a + (w - mean) ** 2, 0);
  const s = Math.sqrt(ss / (jars.length - 1));
  const avgErr = mean - LABEL;
  const sel = s * SCF;
  const avgOk = avgErr >= 0 || -avgErr <= sel;
  const umeOk = ume <= UME_ALLOWED;
  return { ume, mean, s, avgErr, sel, avgOk, umeOk, pass: avgOk && umeOk };
}

function passRate(mu, sd, runs) {
  let p = 0;
  for (let k = 0; k < runs; k++) if (inspect(drawSample(mu, sd)).pass) p++;
  return p / runs;
}

function el(name, attrs, text) {
  const e = document.createElementNS(NS, name);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}

const fmt = (x, d = 1) => (x < 0 ? "−" : x > 0 ? "+" : "") + Math.abs(x).toFixed(d);

function state() {
  return { mu: +$("mu").value, sd: +$("sd").value };
}

function showControls() {
  const { mu, sd } = state();
  $("muOut").textContent = mu.toFixed(1) + " g";
  $("sdOut").textContent = sd.toFixed(1) + " g";
  const give = mu - LABEL;
  $("manyOut").innerHTML = "Your line " + (give >= 0 ? "gives away " : "keeps back ") +
    '<span class="pen mono">' + Math.abs(give).toFixed(1) + " g</span> per jar, on average.";
}

// Strip chart of one sample.
const X0 = 425, X1 = 470, W = 600;
const xs = (w) => 20 + ((Math.min(Math.max(w, X0), X1) - X0) / (X1 - X0)) * (W - 40);

function drawStrip(jars, r) {
  const svg = $("strip");
  svg.replaceChildren();
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim();
  const hair = css.getPropertyValue("--hair").trim();
  const pen = css.getPropertyValue("--pen").trim();
  const stamp = css.getPropertyValue("--stamp").trim();

  svg.append(el("line", { x1: 20, x2: W - 20, y1: 120, y2: 120, stroke: ink }));
  for (let g = X0; g <= X1; g += 5) {
    svg.append(el("line", { x1: xs(g), x2: xs(g), y1: 120, y2: 126, stroke: ink }));
    svg.append(el("text", { x: xs(g), y: 142, "text-anchor": "middle" }, String(g)));
  }
  svg.append(el("text", { x: 20, y: 162 }, "grams"));

  // Rules
  svg.append(el("rect", { x: 20, y: 18, width: xs(LOW) - 20, height: 102, fill: stamp, opacity: 0.08 }));
  svg.append(el("line", { x1: xs(LOW), x2: xs(LOW), y1: 14, y2: 120, stroke: stamp, "stroke-dasharray": "4 3" }));
  svg.append(el("text", { x: xs(LOW) - 4, y: 12, "text-anchor": "end", style: "fill:" + stamp }, "434.1 MAV"));
  svg.append(el("line", { x1: xs(LABEL), x2: xs(LABEL), y1: 14, y2: 120, stroke: ink, "stroke-width": 2 }));
  svg.append(el("text", { x: xs(LABEL) + 4, y: 12 }, "454 label"));

  if (!jars) return;

  // Error limit band below the label, and the sample average.
  if (r.avgErr < 0) {
    svg.append(el("rect", { x: xs(LABEL - r.sel), y: 104, width: xs(LABEL) - xs(LABEL - r.sel), height: 8, fill: hair }));
  }
  svg.append(el("line", { x1: xs(r.mean), x2: xs(r.mean), y1: 96, y2: 148, stroke: pen, "stroke-width": 3 }));
  svg.append(el("text", { x: xs(r.mean), y: 160, "text-anchor": "middle", style: "fill:" + pen }, "avg"));

  const sorted = jars.map((w, i) => ({ w, i })).sort((a, b) => a.w - b.w);
  sorted.forEach(({ w }, k) => {
    const bad = LABEL - w > MAV;
    svg.append(el("circle", {
      cx: xs(w), cy: 30 + (k % 6) * 11, r: 5,
      fill: bad ? stamp : "none", stroke: bad ? stamp : pen, "stroke-width": 2,
    }));
  });
}

function showResult(r) {
  $("f16").textContent = String(r.ume);
  $("f18").textContent = fmt(r.avgErr, 2) + " g";
  $("f21").textContent = r.s.toFixed(2) + " g";
  $("f23").textContent = r.avgErr < 0 ? r.sel.toFixed(2) + " g" : "not needed";
  const st = $("stamp");
  st.className = "stamp " + (r.pass ? "pass" : "fail");
  st.textContent = r.pass ? "Pass" : "Fail";
  let why;
  if (!r.umeOk) why = r.ume + (r.ume === 1 ? " jar is" : " jars are") + " below 434.1 g.";
  else if (!r.avgOk) why = "The average is " + Math.abs(r.avgErr).toFixed(2) + " g short, more than the " + r.sel.toFixed(2) + " g limit.";
  else if (r.avgErr < 0) why = "Short on average by " + Math.abs(r.avgErr).toFixed(2) + " g, inside the " + r.sel.toFixed(2) + " g limit.";
  else why = "At or over the label on average, and no jar below 434.1 g.";
  $("reason").textContent = why;
}

let last = null;

function pullOne() {
  const { mu, sd } = state();
  const jars = drawSample(mu, sd);
  const r = inspect(jars);
  last = [jars, r];
  drawStrip(jars, r);
  showResult(r);
}

function pullMany() {
  const { mu, sd } = state();
  const p = passRate(mu, sd, 1000);
  showControls();
  $("manyOut").innerHTML += " Of 1,000 inspections, <b class=\"pen mono\">" +
    Math.round(p * 1000).toLocaleString("en-US") + "</b> passed.";
}

// Heat map of pass probability.
const MU = [], SD = [];
for (let m = 448; m <= 458.001; m += 0.5) MU.push(+m.toFixed(1));
for (let s = 0.5; s <= 10.001; s += 0.5) SD.push(+s.toFixed(1));
let grid = null;

function computeGrid() {
  grid = SD.map((sd) => MU.map((mu) => passRate(mu, sd, 400)));
}

function drawMap() {
  const svg = $("map");
  svg.replaceChildren();
  const css = getComputedStyle(document.documentElement);
  const ink = css.getPropertyValue("--ink").trim();
  const pen = css.getPropertyValue("--pen").trim();
  const stamp = css.getPropertyValue("--stamp").trim();
  const L = 52, T = 10, CW = 26, CH = 13;
  const { mu, sd } = state();

  SD.forEach((s, j) => {
    MU.forEach((m, i) => {
      const p = grid[j][i];
      const rect = el("rect", {
        x: L + i * CW, y: T + (SD.length - 1 - j) * CH, width: CW - 1, height: CH - 1,
        fill: ink, "fill-opacity": (0.04 + 0.86 * p).toFixed(3),
      });
      rect.append(el("title", {}, m + " g, spread " + s + " g: " + Math.round(p * 100) + "% pass"));
      svg.append(rect);
    });
    if (s % 2 === 0 || s === 0.5) {
      svg.append(el("text", { x: L - 6, y: T + (SD.length - 1 - j) * CH + 10, "text-anchor": "end" }, s.toFixed(1)));
    }
  });
  MU.forEach((m, i) => {
    if (m % 2 === 0) svg.append(el("text", { x: L + i * CW + CW / 2, y: T + SD.length * CH + 16, "text-anchor": "middle" }, String(m)));
  });
  const xl = L + MU.indexOf(LABEL) * CW + CW / 2;
  svg.append(el("line", { x1: xl, x2: xl, y1: T - 4, y2: T + SD.length * CH + 2, stroke: stamp, "stroke-width": 2 }));
  svg.append(el("text", { x: xl + 4, y: T + SD.length * CH + 32, style: "fill:" + stamp }, "label"));
  svg.append(el("text", { x: L + (MU.length * CW) / 2, y: T + SD.length * CH + 48, "text-anchor": "middle" }, "average fill, g"));
  svg.append(el("text", { x: 12, y: T + (SD.length * CH) / 2, transform: "rotate(-90 12 " + (T + (SD.length * CH) / 2) + ")", "text-anchor": "middle" }, "spread, g"));

  // Legend
  const lx = L + MU.length * CW + 18;
  [0, 0.25, 0.5, 0.75, 1].forEach((p, k) => {
    svg.append(el("rect", { x: lx, y: T + k * 18, width: 14, height: 14, fill: ink, "fill-opacity": (0.04 + 0.86 * p).toFixed(3) }));
    svg.append(el("text", { x: lx + 20, y: T + k * 18 + 11 }, Math.round(p * 100) + "%"));
  });

  // The reader's line, if it is on the map.
  const i = MU.indexOf(mu), j = SD.indexOf(sd);
  if (i >= 0 && j >= 0) {
    svg.append(el("circle", {
      cx: L + i * CW + CW / 2 - 0.5, cy: T + (SD.length - 1 - j) * CH + CH / 2 - 0.5, r: 9,
      fill: "none", stroke: pen, "stroke-width": 3,
    }));
  }
}

$("mu").addEventListener("input", () => { showControls(); if (grid) drawMap(); });
$("sd").addEventListener("input", () => { showControls(); if (grid) drawMap(); });
$("one").addEventListener("click", pullOne);
$("many").addEventListener("click", pullMany);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (grid) drawMap(); if (last) drawStrip(...last); });

showControls();
drawStrip(null);
computeGrid();
drawMap();
pullOne();
