// The fast lean: run ISO 3159's fifteen-day chronometer test (category 1,
// casing diameter over 20 mm) on a movement the reader regulates.
"use strict";

// The test programme (ISO 3159:2009, clause 6): day, position, temperature.
const PROGRAMME = [
  [1, "6H", 23], [2, "6H", 23], [3, "3H", 23], [4, "3H", 23], [5, "9H", 23],
  [6, "9H", 23], [7, "FH", 23], [8, "FH", 23], [9, "CH", 23], [10, "CH", 23],
  [11, "CH", 8], [12, "CH", 23], [13, "CH", 38], [14, "6H", 23], [15, "6H", 23],
];
const POSITIONS = ["6H", "3H", "9H", "FH", "CH"];

// Minimum requirements, category 1 (clause 7). "Absolute limits": no rounding.
const LIMITS = {
  M: [-4, 6], V: [null, 2], Vmax: [null, 5], D: [-6, 8], P: [null, 10], C: [-0.6, 0.6], R: [-5, 5],
};

function normal(rand) {
  let u = 0;
  while (u === 0) u = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

// A movement: its aim (rate at 23 C, s/d), a rate offset for each position
// drawn with the positional spread, a day-to-day wobble, and a temperature
// coefficient (s/d per degree C), assumed even across the range.
function movement(p, rand) {
  const off = {};
  for (const pos of POSITIONS) off[pos] = p.spread * normal(rand);
  return { aim: p.aim, off, wobble: p.wobble, coef: p.coef };
}

// The watch's condition E_i (watch minus reference time) is observed and
// rounded to the nearest full second; the daily rate M_i = E_i - E_(i-1).
function run(mv, rand) {
  let t = 0; // true accumulated error, s
  let prevE = 0;
  const days = [];
  for (const [day, pos, temp] of PROGRAMME) {
    const rate = mv.aim + mv.off[pos] + mv.coef * (temp - 23) + mv.wobble * normal(rand);
    t += rate;
    const E = Math.round(t);
    days.push({ day, pos, temp, E, M: E - prevE });
    prevE = E;
  }
  const m = days.map((d) => d.M);
  const M = m.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
  const vars = [0, 2, 4, 6, 8].map((i) => Math.abs(m[i + 1] - m[i]));
  const V = vars.reduce((a, b) => a + b, 0) / 5;
  const Vmax = Math.max(...vars);
  const D = (m[0] + m[1]) / 2 - (m[8] + m[9]) / 2;
  const P = Math.max(...m.slice(0, 10).map((x) => Math.abs(x - M)));
  const C = (m[12] - m[10]) / 30;
  const R = m[14] - (m[0] + m[1]) / 2;
  const crit = { M, V, Vmax, D, P, C, R };
  const fails = Object.keys(LIMITS).filter((k) => {
    const [lo, hi] = LIMITS[k];
    const x = k === "V" || k === "Vmax" || k === "P" ? Math.abs(crit[k]) : crit[k];
    return (lo !== null && x < lo) || x > hi;
  });
  return { days, crit, fails, pass: fails.length === 0 };
}

if (typeof module !== "undefined") module.exports = { PROGRAMME, LIMITS, movement, run, normal };

if (typeof document !== "undefined") {
  const $ = (id) => document.getElementById(id);
  const sgn = (x, d = 1) => (x > 0 ? "+" : x < 0 ? "−" : "") + Math.abs(x).toFixed(d);
  const ctl = {
    aim: [$("aim"), $("aimOut"), (v) => sgn(v) + " s/d"],
    spread: [$("spread"), $("spreadOut"), (v) => v.toFixed(1) + " s/d"],
    wobble: [$("wobble"), $("wobbleOut"), (v) => v.toFixed(1) + " s/d"],
    coef: [$("coef"), $("coefOut"), (v) => sgn(v, 2) + " s/d/°C"],
  };
  const val = () => Object.fromEntries(Object.entries(ctl).map(([k, [el]]) => [k, parseFloat(el.value)]));

  // Axis for box 6: -15 to +15 s/d.
  const LO = -15, HI = 15;
  const pc = (x) => ((Math.max(LO, Math.min(HI, x)) - LO) / (HI - LO)) * 100 + "%";
  function band(id, lo, hi) {
    const el = $(id);
    el.style.left = pc(lo);
    el.style.width = ((hi - lo) / (HI - LO)) * 100 + "%";
  }
  band("winBO", -1, 10);
  band("winISO", -4, 6);
  band("winMETAS", 0, 5);
  band("winWrist", -10, 12);
  band("winISO2", -4, 6);

  function stamp(id, pass, text) {
    const el = $(id);
    el.className = "stamp " + (pass === null ? "idle" : pass ? "pass" : "fail");
    el.textContent = text;
  }

  // Box 6: where the reader's aim, and its rate on a wrist, sit in each window.
  function drawAxis() {
    const p = val();
    const wrist = p.aim + 10 * p.coef;
    for (const id of ["fBO", "fISO", "fMETAS", "fISO2"]) $(id).style.left = pc(p.aim);
    $("fWrist").style.left = pc(wrist);
    const inside = (x, lo, hi) => x >= lo && x <= hi;
    stamp("sBO", inside(p.aim, -1, 10), inside(p.aim, -1, 10) ? "Inside" : "Outside");
    stamp("sISO", inside(p.aim, -4, 6), inside(p.aim, -4, 6) ? "Inside" : "Outside");
    stamp("sMETAS", inside(p.aim, 0, 5), inside(p.aim, 0, 5) ? "Inside" : "Outside");
    stamp("sWrist", inside(wrist, -4, 6), inside(wrist, -4, 6) ? "Inside" : "Outside");
    $("pBO").textContent = sgn(p.aim) + " s/d";
    $("pISO").textContent = sgn(p.aim) + " s/d";
    $("pMETAS").textContent = sgn(p.aim) + " s/d";
    $("pWrist").textContent = sgn(wrist) + " s/d at 33°C";
    $("wristLab").textContent = sgn(wrist) + " s/d";
  }

  const NAMES = {
    M: "Mean daily rate", V: "Mean variation", Vmax: "Greatest variation", D: "Vertical minus horizontal",
    P: "Greatest deviation", C: "Temperature", R: "Resumption",
  };
  const limText = (k) => {
    const [lo, hi] = LIMITS[k];
    return lo === null ? "≤ " + hi : lo === -hi ? "±" + hi : sgn(lo, 0) + " to " + sgn(hi, 0);
  };

  function testOne() {
    const r = run(movement(val(), Math.random), Math.random);
    $("days").innerHTML = r.days
      .map((d) => `<tr${d.temp !== 23 ? ' class="this"' : ""}><td class="num">${d.day}</td><td>${d.pos}</td><td class="num">${d.temp}°C</td><td class="num">${sgn(d.E, 0) || "0"}</td><td class="num">${sgn(d.M, 0) || "0"}</td></tr>`)
      .join("");
    $("crit").innerHTML = Object.keys(LIMITS)
      .map((k) => {
        const x = r.crit[k];
        const bad = r.fails.includes(k);
        const shown = k === "C" ? sgn(x, 3) : k === "V" || k === "Vmax" || k === "P" ? Math.abs(x).toFixed(1) : sgn(x, 1) || "0.0";
        return `<div class="field"><span class="k">${k} · ${NAMES[k]} · ${limText(k)}</span><span class="v${bad ? " red" : ""}">${shown}</span></div>`;
      })
      .join("");
    const failed = r.fails.map((k) => NAMES[k].toLowerCase()).join(", ");
    stamp("stOne", r.pass, r.pass ? "Chronometer" : "Refused");
    $("whyOne").textContent = r.pass
      ? "All seven criteria within the limits. Mean rate " + sgn(r.crit.M) + " s/d over the first ten days."
      : "Failed on " + failed + ".";
  }

  function testMany() {
    const p = val();
    let pass = 0, wristOut = 0;
    const why = {};
    for (let i = 0; i < 1000; i++) {
      const mv = movement(p, Math.random);
      const r = run(mv, Math.random);
      if (r.pass) {
        pass++;
        // Rate on a wrist at 33 C: the movement's own five-position mean at
        // 23 C, shifted by its temperature coefficient over 10 degrees.
        const mean23 = mv.aim + Object.values(mv.off).reduce((a, b) => a + b, 0) / 5;
        const w = mean23 + 10 * mv.coef;
        if (w < -4 || w > 6) wristOut++;
      } else for (const k of r.fails) why[k] = (why[k] || 0) + 1;
    }
    const top = Object.entries(why).sort((a, b) => b[1] - a[1])[0];
    $("manyOut").textContent =
      pass.toLocaleString("en-US") + " of 1,000 certified. " +
      (top ? "Most refusals cite " + NAMES[top[0]].toLowerCase() + " (" + top[1] + "). " : "") +
      (pass ? "Of those certified, " + wristOut + " would run outside −4 to +6 s/d at 33°C." : "");
  }

  for (const [el, out, f] of Object.values(ctl)) {
    const show = () => { out.textContent = f(parseFloat(el.value)); drawAxis(); };
    el.addEventListener("input", show);
    show();
  }
  $("one").addEventListener("click", testOne);
  $("many").addEventListener("click", testMany);
  testOne();
}
