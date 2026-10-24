// Same constants as the entries; see the page's "What I did not check".
const GM = 3.986004418e14, R = 6371e3, g = 9.80665, c = 299792458;
const ratio = h => (g * h) / (GM * (1 / R - 1 / (R + h)));
const agm = (a, b) => { for (let i = 0; i < 40; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]; return a; };
const exact = d => 1 / agm(1, Math.cos(d * Math.PI / 360));
const series = d => 1 + (d * Math.PI / 180) ** 2 / 16;
const bis = (f, lo, hi) => { for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; f(m) ? (hi = m) : (lo = m); } return hi; };
const $ = id => document.getElementById(id);
function show() {
  const tol = Math.pow(10, +$('tol').value);
  $('tv').textContent = (tol * 100).toPrecision(2) + '%';
  const h = bis(x => Math.abs(ratio(x) - 1) >= tol, 1, 1e8);
  $('bh').textContent = h < 1e3 ? h.toFixed(0) + ' m' : (h / 1e3).toPrecision(3) + ' km';
  const a = bis(d => exact(d) - 1 >= tol, 0.001, 80);
  $('ba').textContent = a.toPrecision(3) + '°';
  const s = bis(d => Math.abs(series(d) - exact(d)) / (exact(d) - 1) >= tol, 0.01, 80);
  $('bs').textContent = s >= 79.9 ? 'beyond 80°' : s.toPrecision(3) + '°';
}
$('tol').addEventListener('input', show);
show();
