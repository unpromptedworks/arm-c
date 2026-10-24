// Constants and headline functions copied from the entries' scripts; see the page's "What I did not check".
const D = {
  GM: 3.986004418e14, R: 6371e3, c: 299792458,
  GE: 9.7803253359, K: 0.00193185265241, E2: 0.00669437999013, FA: 3.086e-6,
  kref: 0.13, Rg: 8.314462618, Ma: 28.9647e-3, Mw: 18.01528e-3, P: 101325, cvw: 3.04, trop: 365.242189
};
const sound = p => { // 20 °C, 50% humidity
  const t = 20, es = 611.21 * Math.exp((18.678 - t / 234.5) * (t / (257.14 + t))), x = 0.5 * es / p.P;
  const M = (1 - x) * p.Ma + x * p.Mw, cv = (1 - x) * 2.5 * p.Rg + x * p.cvw * p.Rg;
  return Math.sqrt(((cv + p.Rg) / cv) * p.Rg * (t + 273.15) / M);
};
const grav = p => { const s = Math.pow(Math.sin(Math.PI / 4), 2); return p.GE * (1 + p.K * s) / Math.sqrt(1 - p.E2 * s) - p.FA * 1000; };
const E = [
  { name: 'Tall building: clock rate gain at 828 m', use: ['GM', 'R', 'c'], f: p => p.GM * (1 / p.R - 1 / (p.R + 828)) / (p.c * p.c) },
  { name: 'Pendulum: local g at 45°, 1000 m', use: ['GE', 'K', 'E2', 'FA'], f: grav },
  { name: 'Horizon: distance for 10 m eye height, k as set', use: ['R', 'kref'], f: p => Math.sqrt(2 * p.R / (1 - p.kref) * 10 + 100) },
  { name: 'Sound: speed at 20 °C, 50% humidity', use: ['Rg', 'Ma', 'Mw', 'P', 'cvw'], f: sound },
  { name: 'Calendar: Gregorian years to drift one day', use: ['trop'], f: p => 1 / Math.abs(365 + 97 / 400 - p.trop) }
];
const label = { GM: 'GM (Earth)', R: 'mean Earth radius', c: 'speed of light', GE: 'equatorial gravity', K: 'Somigliana k', E2: 'eccentricity squared', FA: 'free-air gradient', kref: 'refraction k', Rg: 'gas constant', Ma: 'molar mass, dry air', Mw: 'molar mass, water', P: 'pressure', cvw: 'water-vapour heat capacity (units of R)', trop: 'tropical year (days)' };
const rows = [];
for (const e of E) for (const k of e.use) {
  const up = { ...D, [k]: D[k] * (1 + 1e-9) }, dn = { ...D, [k]: D[k] * (1 - 1e-9) };
  rows.push({ e: e.name, k, el: Math.log(e.f(up) / e.f(dn)) / Math.log((1 + 1e-9) / (1 - 1e-9)) });
}
rows.sort((a, b) => Math.abs(b.el) - Math.abs(a.el));
const fmt = x => Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 1e-3 ? x.toPrecision(3) : x.toExponential(1);
document.getElementById('rows').innerHTML = rows.map(r =>
  `<tr><td>${label[r.k]}</td><td>${r.e}</td><td class="num">${fmt(r.el)}</td><td class="num">${fmt(Math.abs(r.el))}%</td></tr>`).join('');
