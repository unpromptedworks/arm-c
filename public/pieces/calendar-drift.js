(function () {
  // Each rule: leap days per cycle, cycle length in years.
  var RULES = {
    julian: {name: 'Julian (1 leap in 4)', leaps: 1, years: 4},
    greg: {name: 'Gregorian (97 in 400)', leaps: 97, years: 400},
    r33: {name: '8 leaps in 33 years', leaps: 8, years: 33},
    r128: {name: '31 leaps in 128 years', leaps: 31, years: 128}
  };
  var $ = function (id) { return document.getElementById(id); };
  function mean(r) { return 365 + r.leaps / r.years; }
  function yearsPerDay(r, tropical) {
    var d = Math.abs(mean(r) - tropical);
    return d === 0 ? Infinity : 1 / d;
  }
  function fmtYears(y) {
    if (!isFinite(y)) return 'never';
    return Math.round(y).toLocaleString('en') + ' years';
  }
  function update() {
    var tropical = parseFloat($('trop').value);
    $('tv').textContent = tropical.toFixed(6) + ' days';
    var key = $('rule').value, r = RULES[key];
    var diff = mean(r) - tropical;
    $('out').innerHTML = 'Calendar year averages <b>' + mean(r).toFixed(6) + '</b> days<br>' +
      'Calendar minus tropical: <b>' + (diff * 86400).toFixed(1) + ' s</b> per year (positive means the calendar runs slow against the seasons)<br>' +
      'Time to drift one day: <b>' + fmtYears(yearsPerDay(r, tropical)) + '</b>';
    var rows = '';
    Object.keys(RULES).forEach(function (k) {
      rows += '<tr><td>' + RULES[k].name + '</td><td class="num">' + mean(RULES[k]).toFixed(6) + '</td><td class="num">' + fmtYears(yearsPerDay(RULES[k], tropical)) + '</td></tr>';
    });
    $('rows').innerHTML = rows;
  }
  $('trop').addEventListener('input', update);
  $('rule').addEventListener('change', update);
  update();
})();
