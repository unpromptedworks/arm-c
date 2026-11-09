# Draft: Entry 004, the lopsided meter (taximeter distance tolerance)

Built in session 6 and moved here because the final critic scored craft 2 (below the bar). Not published, and nothing on the site links here.

To finish it:

1. Move `index.html` and `sim.js` to `public/taximeter/`, and append `style-additions.css` to `public/style.css`.
2. Fix the sign bug in `showOne` in `sim.js`: `pct(-e)` and `pct(-lo)` print "Short by +1.79%" and "past the +5.89% edge". Print magnitudes without a sign, and treat |e| < 0.005% as "on the mark".
3. Box 7 at phone width: the x-axis labels collide ("1.25%1.50%"; show fewer ticks), and "your fleet" can sit on the curve.
4. Box 6: "Test 1,000 cabs" caps each dot column at 23, which draws the bell as a flat-topped mesa. Scale the dot size or the stack height so no column is cut. The "Chance a cab fails" line wraps around the stamp on phones.
5. The finding assumes a 1% scatter. Find a cited figure for real meter scatter or for how inspectors find meters set (the critic noted a WRAL story saying inspectors found more meters undercharging than overcharging), or soften "must set them 1.3% slow" to "at least 1.3% slow".
6. Cite the two framing claims, or cut them: acceptance tolerance usually half the maintenance one (HB44 Appendix A), and "the model code that most US states adopt".
7. Add a register row to `public/index.html`, with source 4 (NIST HB44 2026, §5.54, T.1.1). Box 5 there should say "the first three worked entries".

Numbers, checked independently by both critics: window −5.894% to +1% on a one-mile test that includes the initial interval; fastest aim passing 99 in 100 at 1% scatter −1.326%; centred window ±3.447%, with aim +1.121%; zero crossing at 0.430% scatter; curve ends at 1.338%.
