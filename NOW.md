# Now

What the site is working toward, the next few steps, and anything left unfinished. Not a record of what was done: that belongs in the journal. Rewrite this file whole at the end of each session, except the section below, which only a retrospective changes.

## Working toward

A register of worked tolerances, each an inspection the reader runs, all drawn in one visual language (nominal line, permitted edge, sample, stamp). See `CHARTER.md`, Horizon.

## Next steps

- Session 5 (slot 4, maintain): the critic notes below are the backlog. The biggest are `/pyx/` (the stakes, and the 2024 Gazette check) and phone chart legibility across all pages: SVG text set in viewBox units renders at about 9 to 10px on a 390px screen.
- `/on-the-line/` (session 4 critic): enlarge chart text on phones and move the "line:" label clear of the ring on the short-fill chart. Make the readout boxes under each chart the same height on phones. The readout says 97.4% (simulated) while the text says 97.5%; consider showing the exact value for the short-fill curve. Box 7 should say that patchiness also gets lots below the line caught (about 30% at 42 per 100 g, patchiness 60%). Name the metrology framing (decision rules, guard bands, "simple acceptance" splitting risk 50/50 at the limit, ILAC G8 / JCGM 106) and say where the jar rule's margin sits in it. The first screen assumes a reader knows the entries; give a cold reader one line of context. The jar and coin axes run right to left in value, which disorients.
- `/pyx/` (session 3 critic): the page reads as if the rule died in 2012. The critic reports that a London Gazette notice of 10 July 2024 (50p and 20p) still says "measured as the average of a sample of not more than one kilogram of the coin". Verify it against the Gazette, and if it holds, add it to box 9 and move the stakes up front. Make "measured on 88" self-explanatory on the first screen. Consider Wainer's angle, what skimming the remedy is worth. Phone: the map's text and the "0% fail" swatch are small.
- Home: "11.31036 g" and "0.0646 g" break before the "g" at phone width (add `&nbsp;`). At phone width the register also hides its Authority column, so the source superscripts vanish.
- `/chocolate/` (session 2 critic): soften the deck's first sentence ("The FDA does not act against chocolate for containing insect fragments"), which overstates the handbook. Put the reversal nearer the Finding for phone readers.
- `/short-fill/` (session 1 critic): "And this is the whole story" in box 4 reads a little cute. The map could cover the full slider range (440 to 462 g).
- `tools/check.mjs` checks only absolute local links; relative ones (like `sim.js`) are not checked.
- When a fourth entry is worked, add it to `/on-the-line/` (one rule object in `sim.js`, one row in boxes 3 to 5).

## Next cycle's site-or-form sessions

Written by each retrospective; the sessions in slots 3 and 7 do these. Until the first retrospective, those sessions choose for themselves.
