(function () {
  // WGS84 Somigliana normal gravity (constants as published in the WGS84 tables; see page sources).
  var GE = 9.7803253359, K = 0.00193185265241, E2 = 0.00669437999013, FREE_AIR = 3.086e-6;
  var $ = function (id) { return document.getElementById(id); };
  function g(latDeg, h) {
    var s = Math.pow(Math.sin(latDeg * Math.PI / 180), 2);
    return GE * (1 + K * s) / Math.sqrt(1 - E2 * s) - FREE_AIR * h;
  }
  // Complete elliptic integral K(m), m = k^2, by the arithmetic-geometric mean.
  function ellK(m) {
    var a = 1, b = Math.sqrt(1 - m), t;
    for (var i = 0; i < 30; i++) { t = (a + b) / 2; b = Math.sqrt(a * b); a = t; }
    return Math.PI / (2 * a);
  }
  function ampFactor(deg) { return 2 / Math.PI * ellK(Math.pow(Math.sin(deg * Math.PI / 360), 2)); }
  function sPerDay(ratio) { return (ratio - 1) * 86400; }
  function fmt(x, d) { return (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(d); }
  function update() {
    var lat = +$('lat').value, h = +$('alt').value, amp = +$('amp').value, L = +$('len').value / 1000;
    $('lv').textContent = lat + '°'; $('av').textContent = h + ' m'; $('pv').textContent = amp + '°'; $('ll').textContent = L.toFixed(4) + ' m';
    var gl = g(lat, h), f = ampFactor(amp);
    var quick = 2 * Math.PI * Math.sqrt(L / 9.80665);
    var small = 2 * Math.PI * Math.sqrt(L / gl);
    var full = small * f;
    var series = 1 + Math.pow(amp * Math.PI / 180, 2) / 16;
    $('out').innerHTML =
      'Local g: <b>' + gl.toFixed(5) + '</b> m/s²<br>' +
      'Quick period (standard g = 9.80665, small angle): <b>' + quick.toFixed(5) + '</b> s<br>' +
      'Small-angle period at local g: <b>' + small.toFixed(5) + '</b> s<br>' +
      'Full period (local g, this amplitude): <b>' + full.toFixed(5) + '</b> s<br>' +
      'Clock error of the quick figure: <b>' + fmt(sPerDay(quick / full) , 1) + ' s/day</b> (positive: a clock built on the quick figure gains)<br>' +
      '&nbsp;&nbsp;of which place (g): ' + fmt(sPerDay(quick / small), 1) + ' s/day; amplitude: ' + fmt(sPerDay(small / full), 1) + ' s/day<br>' +
      'Amplitude factor, exact: <b>' + f.toFixed(7) + '</b>; first term only (1+θ²/16): ' + series.toFixed(7) + '<br>' +
      'Length of a true 1-second-swing pendulum here at this amplitude: <b>' + (gl / (Math.PI * Math.PI) / (f * f)).toFixed(5) + '</b> m';
  }
  ['lat', 'alt', 'amp', 'len'].forEach(function (id) { $(id).addEventListener('input', update); });
  update();
})();
