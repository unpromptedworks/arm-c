(function () {
  // CIPM-2007 moist-air density (Picard et al., Metrologia 45 (2008) 149-155, eqs 1, A1.1-A1.4), xCO2 fixed at 0.0004.
  var $ = function (id) { return document.getElementById(id); };
  function air(p, tC, h) {
    var T = 273.15 + tC;
    var psv = Math.exp(1.2378847e-5 * T * T - 1.9121316e-2 * T + 33.93711047 - 6.3431645e3 / T);
    var f = 1.00062 + 3.14e-8 * p + 5.6e-7 * tC * tC;
    var xv = h * f * psv / p;
    var Z = 1 - (p / T) * (1.58123e-6 - 2.9331e-8 * tC + 1.1043e-10 * tC * tC + (5.707e-6 - 2.051e-8 * tC) * xv + (1.9898e-4 - 2.376e-6 * tC) * xv * xv) +
      (p * p / (T * T)) * (1.83e-11 - 0.765e-8 * xv * xv);
    var Ma = 28.96546e-3, Mv = 18.01528e-3, R = 8.314472;
    return p * Ma / (Z * R * T) * (1 - xv * (1 - Mv / Ma));
  }
  // Reading relative to true mass: balance adjusted with 8000 kg/m3 weights in air ac, used in air a on a body of density rho.
  function err(rho, a, ac) { return (1 - a / rho) / (1 - ac / 8000) - 1; }
  function ppm(x) { return (x * 1e6).toFixed(0); }
  function update() {
    var rho = Math.pow(10, +$('rho').value / 100), p = +$('p').value * 100, t = +$('t').value, h = +$('h').value / 100, ac = +$('ac').value / 1000;
    $('rv').textContent = rho.toFixed(0) + ' kg/m³'; $('pv').textContent = (p / 100) + ' hPa'; $('tv').textContent = t + ' °C';
    $('hv').textContent = (h * 100) + ' %'; $('av').textContent = ac.toFixed(3) + ' kg/m³';
    var a = air(p, t, h), aDry = air(p, t, 0), aSat = air(p, t, 1);
    var e = err(rho, a, ac), eConv = err(rho, 1.2, 1.2), eFixed = err(rho, 1.2, ac);
    $('out').innerHTML =
      'Air density (CIPM-2007): <b>' + a.toFixed(4) + '</b> kg/m³ (dry ' + aDry.toFixed(4) + ', saturated ' + aSat.toFixed(4) + ')<br>' +
      'Reading minus true mass, as a fraction of the mass: <b>' + ppm(e) + ' ppm</b> (' + (e * 100).toFixed(3) + '%), so 1 kg reads ' + (1000 * (1 + e)).toFixed(3) + ' g<br>' +
      'Same body in the convention\'s air (1.2 kg/m³, adjusted at 1.2): ' + ppm(eConv) + ' ppm. The part due to today\'s air and the adjustment: <b>' + ppm(e - eConv) + ' ppm</b><br>' +
      'Of that, humidity alone (0 to 100 % at this p and T): <b>' + ppm(err(rho, aSat, ac) - err(rho, aDry, ac)) + ' ppm</b>';
  }
  ['rho', 'p', 't', 'h', 'ac'].forEach(function (id) { $(id).addEventListener('input', update); });
  update();
})();
