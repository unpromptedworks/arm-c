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
      'The tempered fourth is 500 cents against 498.04 for 4:3, a charge of +1.96 cents, and the two beat about 0.3 times a second on this lower note, once every three seconds or so. The fifth carries the same 1.96-cent charge; only the octave costs less.'] },
  { slug: 'tritone', name: 'Septimal tritone', num: 7, den: 5, semis: 6,
    verdict: 'Overcharged by about 17 cents, and it beats 3 times a second.',
    text: ['The keyboard\'s tritone is exactly half an octave, 600 cents, the square root of 2 as a frequency ratio. It is its own inverse: go up six semitones twice and you are an octave higher, so the tritone and its complement are the same size.',
      'The ratio 7:5 (about 582.5 cents, sometimes called Huygens\' tritone) is one pure candidate for the interval, and the tempered tritone is about 17.5 cents sharp of it. Played together the pure and tempered upper notes beat about 3 times a second. 7:5 is a choice: its inverse 10:7 is the other septimal candidate, so the charge is against one chosen ratio. <a href="https://en.wikipedia.org/wiki/Septimal_tritone">Septimal tritone</a> (Wikipedia, CC BY-SA).'] },
  { slug: 'major-third', name: 'Major third', num: 5, den: 4, semis: 4,
    verdict: 'Overcharged by about 14 cents.',
    text: ['This is the claim of the site, and it is willing to be wrong about it: the major third is the interval your ears are most often asked to accept out of tune, and you can hear the cost in ten seconds. Play "both" and count the pulses.',
      'The tempered third sits about 13.7 cents above 5:4. The beats come from nearby harmonics of the two notes failing to meet; a pure 5:4 has none. <a href="https://en.wikipedia.org/wiki/Major_third">Major third</a> (Wikipedia, CC BY-SA) gives the tempered third as 13.69 cents wider than 5:4.'] },
  { slug: 'minor-third', name: 'Minor third', num: 6, den: 5, semis: 3,
    verdict: 'Overcharged by about 16 cents.',
    text: ['The tempered minor third is about 15.6 cents narrower than 6:5, a slightly larger error than the major third\'s and in the other direction.',
      'The two notes beat about 2.4 times a second on this lower note, against the major third\'s 2.2. Whether that reads as dark or merely different is taste; the 15.64 cents is arithmetic. <a href="https://en.wikipedia.org/wiki/Minor_third">Minor third</a> (Wikipedia, CC BY-SA).'] },
  { slug: 'minor-sixth', name: 'Minor sixth', num: 8, den: 5, semis: 8,
    verdict: 'Undercharged by about 14 cents: the major third\'s bill with the sign flipped.',
    text: ['A minor sixth and a major third add up to an octave, and the octave is never charged. So whatever the keyboard adds to the third it must take from the sixth. The 8:5 ratio is 5:4 turned over, and the tempered sixth is about 13.7 cents flat of it, the same size as the third\'s charge.',
      'That makes this the third read upside down, and it sounds it. Play "both" and the pulse is about 2.8 a second, against 2.2 for the major third on the same lower note: the same cents of error beat faster when the notes sit higher. It is the same defect, heard from the other end of the octave. <a href="https://en.wikipedia.org/wiki/Minor_sixth">Minor sixth</a> (Wikipedia, CC BY-SA).'] },
  { slug: 'harmonic-seventh', name: 'Harmonic seventh', num: 7, den: 4, semis: 10,
    verdict: 'Billed for a note it never delivers.',
    text: ['The ratio 7:4 is the seventh harmonic over the fourth. A keyboard has no key for it, so it plays the minor seventh at 1000 cents instead, 31.2 cents sharp of 7:4.',
      'That is the largest charge in this ledger. The cited source says barbershop singers are expected to tune this interval in dominant seventh chords, and also that empirical data (Hagerman and Sundberg, 1980) challenges how accurately they do. <a href="https://en.wikipedia.org/wiki/Harmonic_seventh">Harmonic seventh</a> (Wikipedia, CC BY-SA).'] },
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

const nav = (here) => `<nav><a href="/"${here === '' ? ' aria-current="page"' : ''}>Ledger</a><a href="/tunings/"${here === 'tunings' ? ' aria-current="page"' : ''}>Tunings</a>${intervals.map(i => `<a href="/${i.slug}/"${here === i.slug ? ' aria-current="page"' : ''}>${i.num}:${i.den}</a>`).join('')}</nav>`;

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


// Tunings: the same major triad (root, major third, fifth) under four tunings.
const FIFTH_PY = cents(3 / 2), FIFTH_QC = cents(5) / 4;
const tunings = [
  { key: 'et', name: '12-tone equal', third: 400, fifth: 700,
    note: 'Every semitone 100 cents. The keyboard.' },
  { key: 'py', name: 'Pythagorean', third: cents(81 / 64), fifth: FIFTH_PY,
    note: 'Built from pure 3:2 fifths only. The third is four fifths up, two octaves down.' },
  { key: 'qc', name: 'Quarter-comma meantone', third: cents(5 / 4), fifth: FIFTH_QC,
    note: 'Fifths narrowed by a quarter of the syntonic comma so that the third comes out pure.' },
  { key: 'ji', name: '5-limit just', third: cents(5 / 4), fifth: cents(3 / 2),
    note: 'Pure 5:4 and pure 3:2 for this chord. Pays for it elsewhere: no fixed twelve-key keyboard can do this in every key.' },
].map(t => {
  const f = c => BASE * 2 ** (c / 1200);
  return { ...t, thirdErr: t.third - cents(5 / 4), fifthErr: t.fifth - cents(3 / 2), freqs: [BASE, f(t.third), f(t.fifth)] };
});
const wolfPy = 8400 - 11 * FIFTH_PY, wolfQC = 8400 - 11 * FIFTH_QC;
const cls = e => (Math.abs(e) > 5 ? ' class="hot"' : '');

const tuningsPage = () => {
  const body = `<p class="kicker">Four tunings · one chord</p>
<h1>Meantone buys a pure third with a 5-cent fifth. Equal temperament pays 14 on the third.</h1>
<p class="lede">Tuning is a budget. The octave is fixed, so every tuning decides which of the fifth and the third to pay for. Below, the same major triad on ${BASE} Hz, billed against pure 5:4 and pure 3:2.</p>
<table>
<caption>Cents above the root. Charge is the tuning's size minus the pure ratio's (5:4 = ${cents(5 / 4).toFixed(2)}, 3:2 = ${cents(3 / 2).toFixed(2)}); plus is sharp, minus flat.</caption>
<thead><tr><th>Tuning</th><th>Third</th><th>Third charge</th><th>Fifth</th><th>Fifth charge</th></tr></thead>
<tbody>
${tunings.map(t => `<tr><th scope="row">${t.name}</th><td>${t.third.toFixed(2)}</td><td class="err${Math.abs(t.thirdErr) > 5 ? ' hot' : ''}">${f2(t.thirdErr)}</td><td>${t.fifth.toFixed(2)}</td><td class="err${Math.abs(t.fifthErr) > 5 ? ' hot' : ''}">${f2(t.fifthErr)}</td></tr>`).join('\n')}
</tbody>
</table>
<div class="player chord">
${tunings.map(t => `<button type="button" data-freqs="${t.freqs.map(x => x.toFixed(3)).join(',')}">${t.name}</button>`).join('\n')}
<p class="status" role="status" aria-live="polite">Plays root ${BASE} Hz, third and fifth together for four seconds.</p>
</div>
<h2>What each one pays</h2>
${tunings.map(t => `<p><strong>${t.name}.</strong> ${t.note}</p>`).join('\n')}
<h2>Where the bill goes</h2>
<p>Twelve pure fifths overshoot seven octaves by ${(12 * FIFTH_PY - 8400).toFixed(2)} cents, the Pythagorean comma. Something must absorb it. Equal temperament spreads it over all twelve fifths. Pythagorean tuning and quarter-comma meantone put it all in one fifth, the wolf: eleven good fifths and a twelfth of ${wolfPy.toFixed(2)} cents in Pythagorean tuning, ${wolfQC.toFixed(2)} cents in meantone. A pure fifth is ${cents(3 / 2).toFixed(2)}; the meantone wolf is ${(wolfQC - cents(3 / 2)).toFixed(2)} cents sharp of that, and you can hear it. Meantone keeps the thirds pure in the keys it was built for by narrowing eleven fifths by ${(cents(3 / 2) - FIFTH_QC).toFixed(2)} cents each, and that one is the price.</p>
<p>That is the ledger's claim restated: equal temperament pays a little on every interval so that nothing is ruinous. Glossary: the <em>wolf</em> is the one fifth left over when the circle of twelve fifths is closed, so called for its howl; the <em>syntonic comma</em> (about 21.5 cents) is the gap between four pure fifths and a pure major third two octaves up; <em>5-limit</em> means every ratio is built from the primes 2, 3 and 5. Sources: <a href="https://en.wikipedia.org/wiki/Pythagorean_tuning">Pythagorean tuning</a>, <a href="https://en.wikipedia.org/wiki/Quarter-comma_meantone">Quarter-comma meantone</a>, <a href="https://en.wikipedia.org/wiki/Just_intonation">Just intonation</a> (Wikipedia, CC BY-SA). Every figure here is computed in the build.</p>`;
  return page('Tunings · The Cent Ledger', 'tunings', body, true);
};

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
mkdirSync('public/tunings', { recursive: true });
writeFileSync('public/tunings/index.html', tuningsPage());
writeFileSync('public/style.css', css);
writeFileSync('public/play.js', play);
writeFileSync('public/_headers', '/*\n  X-Robots-Tag: noindex\n');

// Checks: every page has noindex and the about link; headers present.
for (const p of ['public/index.html', 'public/tunings/index.html', ...intervals.map(i => `public/${i.slug}/index.html`)]) {
  const h = readFileSync(p, 'utf8');
  if (!h.includes('<meta name="robots" content="noindex">') || !h.includes('https://unpromptedworks.com/#about')) throw new Error('rule check failed: ' + p);
}
console.log('built', intervals.length + 2, 'pages');
