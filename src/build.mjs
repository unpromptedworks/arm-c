// Generates public/ from the interval data below. No dependencies.
import { writeFileSync, readFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';

const BASE = 220; // A3, Hz
const cents = r => 1200 * Math.log2(r);
const f2 = n => (n >= 0 ? '+' : '−') + Math.abs(n).toFixed(2);

const intervals = [
  { slug: 'fifth', name: 'Perfect fifth', num: 3, den: 2, semis: 7,
    verdict: 'Nearly paid in full.',
    text: ['The fifth is the one interval equal temperament barely touches. The tempered fifth is about two hundredths of a semitone narrower than 3:2, and the two versions beat less than once every two seconds.',
      'This is why the compromise exists. The reason is the Pythagorean comma: twelve pure 3:2 fifths overshoot seven octaves by about 23.5 cents, and temperament closes the circle by narrowing each of the twelve fifths by about 2 cents. The thirds are then whatever that arrangement leaves them.'] },
  { slug: 'fourth', name: 'Perfect fourth', num: 4, den: 3, semis: 5,
    verdict: 'Nearly paid in full, the other way.',
    text: ['The fourth is the fifth turned upside down, so its error is the same size with the opposite sign: the tempered fourth is slightly wide of 4:3 where the fifth is slightly narrow of 3:2.',
      'Played alone, most listeners will not catch it. Played by a bowed string quartet, they will tune it by ear to 4:3 without being asked.'] },
  { slug: 'tritone', name: 'Septimal tritone', num: 7, den: 5, semis: 6,
    verdict: 'Overcharged by about 17 cents, and it beats 3 times a second.',
    text: ['The keyboard\'s tritone is exactly half an octave, 600 cents, the square root of 2 as a frequency ratio. It is its own inverse: go up six semitones twice and you are an octave higher, so the tritone and its complement are the same size.',
      'The ratio 7:5 (about 582.5 cents, sometimes called Huygens\' tritone) is one pure candidate for the interval, and the tempered tritone is about 17.5 cents sharp of it. Played together the pure and tempered upper notes beat about 3 times a second. 7:5 is a choice: its inverse 10:7 is the other septimal candidate, so the charge is against one chosen ratio. <a href="https://en.wikipedia.org/wiki/Septimal_tritone">Septimal tritone</a> (Wikipedia, CC BY-SA).'] },
  { slug: 'major-third', name: 'Major third', num: 5, den: 4, semis: 4,
    verdict: 'Overcharged by about 14 cents.',
    text: ['This is the claim of the site, and it is willing to be wrong about it: the major third is the interval your ears are most often asked to accept out of tune, and you can hear the cost in ten seconds. Play "both" and count the pulses.',
      'The tempered third sits about 13.7 cents above 5:4. The beats come from the nearby harmonics of the two notes failing to meet: they are the shimmer a pure third does not have. A choir singing without a keyboard drifts toward 5:4 because it sounds still.'] },
  { slug: 'minor-third', name: 'Minor third', num: 6, den: 5, semis: 3,
    verdict: 'Overcharged by about 16 cents.',
    text: ['The tempered minor third is about 15.6 cents narrower than 6:5, a slightly larger error than the major third\'s and in the other direction.',
      'Because the error is flat rather than sharp, a tempered minor chord can sound dark or thin depending on the register. That is a matter of taste, and the numbers are not.'] },
  { slug: 'minor-sixth', name: 'Minor sixth', num: 8, den: 5, semis: 8,
    verdict: 'Undercharged by about 14 cents: the major third\'s bill with the sign flipped.',
    text: ['A minor sixth and a major third add up to an octave, and the octave is never charged. So whatever the keyboard adds to the third it must take from the sixth. The 8:5 ratio is 5:4 turned over, and the tempered sixth is about 13.7 cents flat of it, the same size as the third\'s charge.',
      'That makes this the third read upside down, and it sounds it. Play "both" and the pulse is about 2.8 a second, against 2.2 for the major third on the same lower note: the same cents of error beat faster when the notes sit higher. It is the same defect, heard from the other end of the octave. <a href="https://en.wikipedia.org/wiki/Minor_sixth">Minor sixth</a> (Wikipedia, CC BY-SA).'] },
  { slug: 'harmonic-seventh', name: 'Harmonic seventh', num: 7, den: 4, semis: 10,
    verdict: 'Billed for a note it never delivers.',
    text: ['The ratio 7:4 is the seventh harmonic over the fourth. A keyboard has no key for it, so it plays the minor seventh at 1000 cents instead, 31.2 cents sharp of 7:4.',
      'That is the largest error in this ledger, and the one most listeners have never heard in its pure form. Hear 7:4 first and the tempered seventh sounds, briefly, like a mistake.'] },
  { slug: 'octave', name: 'Octave', num: 2, den: 1, semis: 12,
    verdict: 'Never charged.',
    text: ['Equal temperament keeps the octave exact. Everything else is divided inside it.',
      'The two versions are the same note, so "both" gives you one steady tone with no beating. That silence is the baseline for everything else here.'] },
].map(i => {
  const r = i.num / i.den;
  const just = cents(r), temp = i.semis * 100;
  const fj = BASE * r, ft = BASE * 2 ** (i.semis / 12);
  return { ...i, just, temp, err: temp - just, fj, ft, beat: Math.abs(fj - ft) };
});

const nav = (here) => `<nav><a href="/"${here === '' ? ' aria-current="page"' : ''}>Ledger</a>${intervals.map(i => `<a href="/${i.slug}/"${here === i.slug ? ' aria-current="page"' : ''}>${i.num}:${i.den}</a>`).join('')}</nav>`;

const page = (title, here, body, script) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header><a class="mark" href="/">The Cent Ledger</a>${nav(here)}</header>
<main>
${body}
</main>
<footer>
<p>Intervals are computed in the build from the ratios shown; cents are 1200·log₂(ratio). Reference: <a href="https://en.wikipedia.org/wiki/Cent_(music)">Cent (music)</a>, <a href="https://en.wikipedia.org/wiki/Equal_temperament">Equal temperament</a> (Wikipedia, CC BY-SA). Sounds are synthesised in your browser.</p>
<p><a href="https://unpromptedworks.com/#about">About this experiment: an AI made this site.</a></p>
</footer>
${script ? '<script src="/play.js"></script>' : ''}
</body>
</html>
`;

const row = i => `<tr><th scope="row"><a href="/${i.slug}/">${i.name}</a></th><td>${i.num}:${i.den}</td><td>${i.just.toFixed(2)}</td><td>${i.temp}</td><td class="err${Math.abs(i.err) > 10 ? ' hot' : ''}">${f2(i.err)}</td><td>${i.beat.toFixed(2)}</td></tr>`;

const home = `<h1>Every piano is slightly out of tune, on purpose. Here is the bill.</h1>
<p class="lede">Twelve-tone equal temperament makes all twelve semitones the same size, so a keyboard can play in every key. The price is that almost every interval except the octave is a little off from the whole-number ratio it is trying to be. This ledger lists each charge in cents (hundredths of a semitone) and lets you hear it.</p>
<table>
<caption>Lower note ${BASE} Hz (A3). Charge is tempered minus pure: plus means the keyboard is sharp of the pure interval, minus flat. Beat is the difference in Hz between the pure and tempered upper notes.</caption>
<thead><tr><th>Interval</th><th>Pure ratio</th><th>Pure, cents</th><th>Tempered, cents</th><th>Charge, cents</th><th>Beat, Hz</th></tr></thead>
<tbody>
${intervals.map(row).join('\n')}
</tbody>
</table>
<h2>What this site claims</h2>
<p>That the fifth is a bargain and the thirds are not. A tempered fifth is off by about 2 cents; a tempered major third by about 14, seven times as much. The claim is about what you can hear: open any interval, press "both", and the pure and tempered notes beat against each other. If a pulse at 2 Hz does not bother you, we are wrong about how much it matters, though not about the numbers.</p>
<p>Open an interval to hear it.</p>`;

function intervalPage(i) {
  const body = `<p class="kicker">${i.num}:${i.den} · ${i.semis} semitones</p>
<h1>${i.name}. ${i.verdict}</h1>
<dl class="figs">
<div><dt>Pure</dt><dd>${i.just.toFixed(2)}¢</dd></div>
<div><dt>Tempered</dt><dd>${i.temp}¢</dd></div>
<div><dt>Charge</dt><dd${Math.abs(i.err) > 1 ? ' class="hot"' : ''}>${f2(i.err)}¢</dd></div>
<div><dt>Beat</dt><dd>${i.beat.toFixed(2)} Hz</dd></div>
</dl>
<div class="player" data-low="${BASE}" data-pure="${i.fj}" data-temp="${i.ft}">
<button type="button" data-play="pure">Pure ${i.num}:${i.den}</button>
<button type="button" data-play="temp">Tempered</button>
<button type="button" data-play="both">Both together</button>
<p class="status" role="status" aria-live="polite">Lower note ${BASE} Hz. Pure upper ${i.fj.toFixed(2)} Hz. Tempered upper ${i.ft.toFixed(2)} Hz.</p>
</div>
${i.text.map(t => `<p>${t}</p>`).join('\n')}
<p><a href="/">Back to the ledger</a></p>`;
  return page(`${i.name} · The Cent Ledger`, i.slug, body, true);
}

const play = `// Plays the lower note with the pure and/or tempered upper note. Browser only.
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
  document.querySelectorAll('.player').forEach(function (p) {
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
`;

const css = `:root{--bg:#1428e0;--ink:#f6f3ea;--hot:#ffd60a;--rule:rgba(246,243,234,.45)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:18px/1.55 system-ui,"Helvetica Neue",Arial,sans-serif}
a{color:inherit;text-decoration-thickness:2px;text-underline-offset:3px}
a:hover,a:focus-visible{color:var(--hot)}
header,main,footer{max-width:60rem;margin:0 auto;padding:0 16px}
header{padding-top:20px;padding-bottom:12px;border-bottom:3px solid var(--ink)}
.mark{font-weight:900;font-size:1.1rem;text-decoration:none;text-transform:uppercase;letter-spacing:.06em}
nav{display:flex;flex-wrap:wrap;gap:4px 16px;margin-top:8px;font:14px ui-monospace,Menlo,Consolas,monospace}
nav a[aria-current]{color:var(--hot);text-decoration:none;font-weight:700}
main{padding-top:32px;padding-bottom:32px}
h1{font-size:clamp(2rem,6vw,3.6rem);line-height:1.02;letter-spacing:-.025em;font-weight:900;margin:0 0 24px}
h2{font-size:1.4rem;margin:40px 0 8px;text-transform:uppercase;letter-spacing:.05em}
.lede{font-size:1.2rem;max-width:42rem}
p{max-width:42rem}
.kicker{font:14px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;letter-spacing:.1em;color:var(--hot);margin:0 0 8px}
table{width:100%;border-collapse:collapse;margin:32px 0;font-variant-numeric:tabular-nums}
caption{text-align:left;font:13px ui-monospace,Menlo,Consolas,monospace;padding-bottom:8px}
th,td{padding:10px 8px;border-bottom:1px solid var(--rule);text-align:right}
th:first-child,td:first-child{text-align:left}
thead th{font:12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase;border-bottom:3px solid var(--ink)}
tbody td{font-family:ui-monospace,Menlo,Consolas,monospace}
.hot,.err.hot{color:var(--hot);font-weight:700}
@media(max-width:560px){body{font-size:17px}th,td{padding:8px 4px;font-size:13px}thead th{font-size:10px}}
.figs{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0;margin:24px 0;border-top:3px solid var(--ink)}
.figs div{padding:12px 0;border-bottom:1px solid var(--rule)}
dt{font:12px ui-monospace,Menlo,Consolas,monospace;text-transform:uppercase}
dd{margin:0;font:900 2rem/1.1 system-ui,sans-serif;font-variant-numeric:tabular-nums}
.player{margin:24px 0 32px;padding:16px 0;border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
button{font:700 1rem system-ui,sans-serif;background:var(--ink);color:var(--bg);border:0;padding:12px 18px;margin:0 8px 8px 0;cursor:pointer}
button:hover,button:focus-visible{background:var(--hot)}
.status{font:13px ui-monospace,Menlo,Consolas,monospace;margin:8px 0 0}
footer{padding-top:16px;padding-bottom:40px;border-top:3px solid var(--ink);font-size:14px}
`;

mkdirSync('public', { recursive: true });
for (const f of readdirSync('public')) if (f.endsWith('.html')) unlinkSync('public/' + f);
writeFileSync('public/index.html', page('The Cent Ledger', '', home, false));
for (const i of intervals) {
  mkdirSync(`public/${i.slug}`, { recursive: true });
  writeFileSync(`public/${i.slug}/index.html`, intervalPage(i));
}
writeFileSync('public/style.css', css);
writeFileSync('public/play.js', play);
writeFileSync('public/_headers', '/*\n  X-Robots-Tag: noindex\n');

// Checks: every page has noindex and the about link; headers present.
for (const p of ['public/index.html', ...intervals.map(i => `public/${i.slug}/index.html`)]) {
  const h = readFileSync(p, 'utf8');
  if (!h.includes('<meta name="robots" content="noindex">') || !h.includes('https://unpromptedworks.com/#about')) throw new Error('rule check failed: ' + p);
}
console.log('built', intervals.length + 1, 'pages');
