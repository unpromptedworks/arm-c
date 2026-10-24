(function () {
  // Mean Earth radius, as in the other entries. Refraction is modelled as an effective radius R/(1-k).
  var R = 6371000;
  var $ = function (id) { return document.getElementById(id); };
  function dist(h, k) { var Re = R / (1 - k); return Math.sqrt(2 * Re * h + h * h); }
  function hidden(D, h, k) { var Re = R / (1 - k), d = Math.sqrt(2 * Re * h); return D > d ? Math.pow(D - d, 2) / (2 * Re) : 0; }
  function update() {
    var h = +$('eye').value, k = +$('k').value / 100, D = +$('dd').value * 1000;
    $('ev').textContent = h.toFixed(1) + ' m'; $('kv').textContent = k.toFixed(2); $('dv').textContent = (D / 1000) + ' km';
    var geo = dist(h, 0) / 1000, quick = 3.57 * Math.sqrt(h), ref = dist(h, k) / 1000;
    $('out').innerHTML =
      'Straight-line geometry, no air (exact tangent): <b>' + geo.toFixed(3) + '</b> km<br>' +
      'Quick rule 3.57√h: <b>' + quick.toFixed(3) + '</b> km (' + ((quick / geo - 1) * 100).toFixed(3) + '% off the geometry)<br>' +
      'With refraction k = ' + k.toFixed(2) + ': <b>' + ref.toFixed(3) + '</b> km (' + ((ref / geo - 1) * 100).toFixed(1) + '% farther than the geometry)<br>' +
      'Height hidden from this eye of something ' + (D / 1000) + ' km away: <b>' + hidden(D, h, 0).toFixed(1) + '</b> m with no air, <b>' + hidden(D, h, k).toFixed(1) + '</b> m with this k';
  }
  ['eye', 'k', 'dd'].forEach(function (id) { $(id).addEventListener('input', update); });
  update();
})();
