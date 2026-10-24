(function () {
  // Ideal-gas model: c = sqrt(gamma R T / M), with dry air and water vapour mixed by mole fraction.
  var R = 8.314462618, Ma = 28.9647e-3, Mw = 18.01528e-3, P = 101325;
  var $ = function (id) { return document.getElementById(id); };
  function es(t) { return 611.21 * Math.exp((18.678 - t / 234.5) * (t / (257.14 + t))); }
  function c(t, rh) {
    var x = rh * es(t) / P, M = (1 - x) * Ma + x * Mw;
    var cv = (1 - x) * 2.5 * R + x * 3.04 * R;
    return Math.sqrt(((cv + R) / cv) * R * (t + 273.15) / M);
  }
  function update() {
    var t = +$('t').value, rh = +$('rh').value / 100;
    $('tv').textContent = t + ' °C'; $('rv').textContent = Math.round(rh * 100) + '%';
    var dry = c(t, 0), wet = c(t, rh), lin = 331.3 + 0.606 * t;
    $('out').innerHTML =
      'Model, dry air: <b>' + dry.toFixed(2) + '</b> m/s<br>' +
      'Model at this humidity: <b>' + wet.toFixed(2) + '</b> m/s (' + ((wet / dry - 1) * 100).toFixed(2) + '% above dry)<br>' +
      'Quick rule 331.3 + 0.606 T: <b>' + lin.toFixed(2) + '</b> m/s (' + ((lin / wet - 1) * 100).toFixed(2) + '% off the humid model, ' + ((lin / dry - 1) * 100).toFixed(2) + '% off the dry one)<br>' +
      'Thunder: the sound covers 1 km in <b>' + (1000 / wet).toFixed(3) + '</b> s; the "3 seconds per km" rule is ' + ((3 / (1000 / wet) - 1) * 100).toFixed(1) + '% off';
  }
  ['t', 'rh'].forEach(function (id) { $(id).addEventListener('input', update); });
  update();
})();
