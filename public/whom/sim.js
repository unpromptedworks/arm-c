// Whom it forgives (Form UE-3): one fault, in percent of nominal, put through
// the three worked rules that have a nominal to be off from. Positive = in the
// favour of whoever controls the error (packer underfills, Mint strikes light,
// meter registers too much distance). The models are those of the entry pages:
// /short-fill/ (simulated), /pyx/ and /taximeter/ (normal, closed form).
"use strict";

const $ = (id) => document.getElementById(id);
const LO = -6, HI = 6; // axis range, percent

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
// Normal CDF (Abramowitz and Stegun 7.1.26, error under 1.5e-7).
function Phi(z) {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z / 2);
  return z >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}

// Entry 001: 12 jars of a 454 g label. Pass if no jar is more than 19.9 g
// short and the average's shortfall is at most 0.635 x the sample SD.
// Fixed normal draws (seeded), so the readout does not flicker.
const RUNS = 20000;
const Z = (() => {
  const r = rng(3003), z = new Float64Array(RUNS * 12);
  for (let i = 0; i < z.length; i++) z[i] = normalFrom(r);
  return z;
})();
function jarPass(f, s) {
  const mu = 454 * (1 - f / 100), sd = 454 * s / 100;
  let pass = 0;
  for (let k = 0; k < RUNS; k++) {
    let sum = 0, sq = 0, ok = true;
    for (let i = 0; i < 12; i++) {
      const w = mu + sd * Z[k * 12 + i];
      if (w < 454 - 19.9) { ok = false; break; }
      sum += w; sq += w * w;
    }
    if (!ok) continue;
    const m = sum / 12, v = Math.max(0, (sq - 12 * m * m) / 11);
    if (454 - m <= 0.635 * Math.sqrt(v)) pass++;
  }
  return pass / RUNS;
}
// Entry 003: the average of 88 ten-pence coins (not more than 1 kg) must be
// within 0.0646 g of 11.31036 g, i.e. within 0.5712% of the standard.
const COIN = 100 * 0.0646 / 11.31036;
function coinPass(f, s) {
  const sd = s / Math.sqrt(88);
  if (sd === 0) return Math.abs(f) <= COIN ? 1 : 0;
  return Phi((COIN - f) / sd) - Phi((-COIN - f) / sd);
}
// Entry 004: one cab on the measured mile. Pass if the meter registers no
// more than 1% too much distance and no more than 4% too little.
function taxiPass(f, s) {
  if (s === 0) return f <= 1 && f >= -4 ? 1 : 0;
  return Phi((1 - f) / s) - Phi((-4 - f) / s);
}

const MAV = 100 * 19.9 / 454; // 4.383%

function pos(x) { return (100 * (Math.min(HI, Math.max(LO, x)) - LO) / (HI - LO)) + "%"; }
function band(el, a, b) { el.style.left = pos(a); el.style.width = `calc(${pos(b)} - ${pos(a)})`; }
function chance(p) {
  if (p >= 0.9995) return "1,000 in 1,000";
  if (p < 0.0005) return "0 in 1,000";
  return Math.round(p * 1000).toLocaleString("en-US") + " in 1,000";
}
function sgn(x) { return (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(2) + "%"; }

function setRow(key, p) {
  $(key + "P").textContent = chance(p);
  const st = $(key + "S");
  st.className = "stamp " + (p >= 0.5 ? "pass" : "fail");
  st.textContent = p >= 0.5 ? "Pass" : "Fail";
}

function update() {
  const f = +$("fault").value, s = +$("spread").value;
  $("faultOut").textContent = f === 0 ? "on the mark" : sgn(f) + (f > 0 ? " their way" : " against them");
  $("spreadOut").textContent = s.toFixed(2) + "%";

  // The average test's allowance at this spread (taking the sample SD as s).
  const avgEdge = 0.635 * s;
  band($("jarAvg"), 0, avgEdge);
  $("jarAvgLab").textContent = "average may be short by 0.635 × SD ≈ " + avgEdge.toFixed(2) + "%";

  for (const id of ["jarF", "coinF", "taxiF"]) $(id).style.left = pos(f);
  for (const id of ["jarSp", "coinSp", "taxiSp"]) band($(id), f - s, f + s);
  const cs = s / Math.sqrt(88);
  band($("coinAvgSp"), f - cs, f + cs);

  const pj = jarPass(f, s), pc = coinPass(f, s), pt = taxiPass(f, s);
  setRow("jar", pj); setRow("coin", pc); setRow("taxi", pt);

  // One sentence on what the three verdicts say together.
  const v = [pj, pc, pt].map((p) => p >= 0.5);
  const names = ["the jar rule", "the coin rule", "the meter rule"];
  const pass = names.filter((_, i) => v[i]), fail = names.filter((_, i) => !v[i]);
  let line;
  if (!fail.length) line = "All three rules pass this fault more often than not.";
  else if (!pass.length) line = "All three rules catch this fault more often than not.";
  else line = cap(join(pass)) + (pass.length > 1 ? " pass" : " passes") + " it; " + join(fail) + (fail.length > 1 ? " catch" : " catches") + " it.";
  $("verdict").textContent = line;
}
function join(a) { return a.length === 1 ? a[0] : a.slice(0, -1).join(", ") + " and " + a[a.length - 1]; }
function cap(t) { return t[0].toUpperCase() + t.slice(1); }

// Fixed edges.
band($("jarWin"), LO - 1, MAV);
band($("coinWin"), -COIN, COIN);
band($("taxiWin"), -4, 1);

$("fault").addEventListener("input", update);
$("spread").addEventListener("input", update);
for (const b of document.querySelectorAll("[data-f]")) {
  b.addEventListener("click", () => {
    $("fault").value = b.dataset.f; $("spread").value = b.dataset.s; update();
  });
}
update();

if (typeof module !== "undefined") module.exports = { jarPass, coinPass, taxiPass };
