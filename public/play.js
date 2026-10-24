// Plays the lower note with the pure and/or tempered upper note. Browser only.
(function () {
  var ctx;
  function tone(f, t0, dur, gain) {
    var amps = [1, 0.5, 0.33, 0.25, 0.2, 0.16];
    amps.forEach(function (a, k) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = f * (k + 1);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(gain * a, t0 + 0.05);
      g.gain.setValueAtTime(gain * a, t0 + dur - 0.3);
      g.gain.linearRampToValueAtTime(0, t0 + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    });
  }
  document.querySelectorAll('.player.chord').forEach(function (p) {
    p.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        var t = ctx.currentTime + 0.05, fs = b.dataset.freqs.split(',').map(Number);
        fs.forEach(function (f) { tone(f, t, 4, 0.16 / (1 + fs.length)); });
      });
    });
  });
  document.querySelectorAll('.player:not(.chord)').forEach(function (p) {
    var low = +p.dataset.low, pure = +p.dataset.pure, temp = +p.dataset.temp;
    p.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        var t = ctx.currentTime + 0.05, m = b.dataset.play;
        var uppers = m === 'pure' ? [pure] : m === 'temp' ? [temp] : [pure, temp];
        var g = 0.16 / (1 + uppers.length);
        tone(low, t, 4, g);
        uppers.forEach(function (f) { tone(f, t, 4, g); });
      });
    });
  });
})();
