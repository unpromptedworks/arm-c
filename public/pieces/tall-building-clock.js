(function () {
  var C = 299792458, G0 = 9.80665, GM = 3.986004418e14, R = 6371e3, YEAR = 365.25 * 86400;
  var short = function (h) { return G0 * h / (C * C); };
  var pot = function (h) { return GM * (1 / R - 1 / (R + h)) / (C * C); };
  var $ = function (id) { return document.getElementById(id); };
  var hm = function (s) { return Math.pow(10, parseFloat(s)); }; // slider is log10 metres
  function fmt(x) { return x === 0 ? '0' : x.toExponential(3); }
  function dur(s) {
    if (s >= 1) return s.toFixed(3) + ' s';
    if (s >= 1e-3) return (s * 1e3).toFixed(3) + ' ms';
    if (s >= 1e-6) return (s * 1e6).toFixed(3) + ' µs';
    return (s * 1e9).toFixed(3) + ' ns';
  }
  function len(m) { return m >= 1e3 ? (m / 1e3).toLocaleString('en', {maximumFractionDigits: 1}) + ' km' : m.toFixed(1) + ' m'; }
  function update() {
    var h = hm($('h').value), T = parseFloat($('t').value) * YEAR;
    $('hv').textContent = len(h);
    $('tv').textContent = $('t').value + ' years';
    var a = short(h), b = pot(h);
    $('out').innerHTML = 'Fractional rate gain, shortcut: <b>' + fmt(a) + '</b><br>' +
      'Fractional rate gain, potential: <b>' + fmt(b) + '</b><br>' +
      'Time gained over the period (potential): <b>' + dur(b * T) + '</b><br>' +
      'Shortcut ÷ potential: <b>' + (a / b).toFixed(3) + '</b>';
  }
  $('h').max = 8; // 10^8 m = 100 000 km
  $('h').value = Math.log10(828);
  $('h').addEventListener('input', update);
  $('t').addEventListener('input', update);
  [['r1', 828], ['r2', 1e6], ['r3', 8.41e6]].forEach(function (p) { $(p[0]).textContent = (short(p[1]) / pot(p[1])).toFixed(3); });
  update();
})();
