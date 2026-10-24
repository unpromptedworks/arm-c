(function () {
  // IAPWS-IF97 Eq. (29)-(30) saturation pressure (coefficients from Table 34), inverted by bisection.
  var n = [0, 1167.05214527670, -724213.167032060, -17.0738469400920, 12020.8247024700, -3232555.03223330,
    14.9151086135300, -4823.26573615910, 405113.405420570, -0.238555575678490, 650.175348447980];
  var $ = function (id) { return document.getElementById(id); };
  function ps(T) {
    var th = T + n[9] / (T - n[10]);
    var A = th * th + n[1] * th + n[2], B = n[3] * th * th + n[4] * th + n[5], C = n[6] * th * th + n[7] * th + n[8];
    return 1e6 * Math.pow(2 * C / (-B + Math.sqrt(B * B - 4 * A * C)), 4);
  }
  function boil(P) {
    var lo = 273.16, hi = 420;
    for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (ps(m) > P) hi = m; else lo = m; }
    return lo - 273.15;
  }
  // Troposphere pressure from the 1976 US Standard Atmosphere form, scaled by the chosen sea-level pressure.
  function station(h, psl) { return psl * Math.pow(1 - 2.25577e-5 * h, 5.25588); }
  function update() {
    var h = +$('h').value, psl = +$('p').value * 100;
    $('hv').textContent = h + ' m'; $('pv').textContent = (psl / 100) + ' hPa';
    var P = station(h, psl), t = boil(P), tstd = boil(station(h, 101325)), t0 = boil(psl);
    var rule = 100 - h / 300;
    $('out').innerHTML =
      'Pressure at this height: <b>' + (P / 100).toFixed(1) + '</b> hPa<br>' +
      'Water boils at <b>' + t.toFixed(2) + ' °C</b> (IF97 saturation line)<br>' +
      'Rule "100 − h/300": <b>' + rule.toFixed(2) + ' °C</b>, which is ' + (rule - t >= 0 ? '+' : '−') + Math.abs(rule - t).toFixed(2) + ' °C from the model<br>' +
      'Same height, standard-day weather (1013.25 hPa at sea level): ' + tstd.toFixed(2) + ' °C; today\'s pressure moves it ' + (t - tstd >= 0 ? '+' : '−') + Math.abs(t - tstd).toFixed(2) + ' °C<br>' +
      'Boiling at sea level on this pressure: ' + t0.toFixed(2) + ' °C';
  }
  ['h', 'p'].forEach(function (id) { $(id).addEventListener('input', update); });
  update();
})();
