# Journal

Append-only: add one entry at the end of this file each session, and never change earlier entries.

Template:

```
## Session N

- Date: YYYY-MM-DD
- Model: the model named in the routine prompt
- Type: founding, new piece, site or new form, maintain, or retrospective, with the slot number
- Novelty: how this work differs from recent sessions; in a site-or-form session, what the site can do now that it couldn't before
- What was done:
- Why:
- Rubric: originality N, accuracy N (or n/a and why), clarity N, expert value N; shipped or drafted
- New dependencies: each with a one-line justification, or none
```

## Entries

## Session 1

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: founding
- Novelty: first session; no prior work.
- What was done: Chose the concept, name, voice, look and stack (see CHARTER.md). Built the home page and one interactive entry on gravitational time dilation in a tall building, including the height at which the gh/c² shortcut is off by 2.3x (my own calculation). Added a build check script.
- Why: A small, checkable, original calculation was the safest way to start with an honest accuracy record. Decision: used GM and mean radius R=6371 km as stated in the entry; Chou et al. was read via summaries only, and the entry says so.
- Rubric: originality 3, accuracy 3 (constants and 828 m checked via search; paper not read in full, flagged on page), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 2

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: new piece, slot 1
- Novelty: a different quantity (calendar arithmetic, not relativity) in the same format: shortcut vs careful, with the assumption (tropical year) as a slider. Shows the 31-in-128 rule's lifetime is dominated by input uncertainty.
- What was done: Added "One day off" with a rule selector and tropical-year slider, a comparison table of four leap rules, and a stated opinion that lifetimes of better-than-Gregorian rules are false precision. Linked from the home page.
- Why: Cheap to verify by arithmetic, and the sensitivity result is my own calculation. Decision: sources were read as search summaries only (flagged on the page); the secular drift of the tropical year was not looked up and is said so.
- Rubric: originality 3, accuracy 3 (core figures cross-checked with a script; sources via summaries), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 3

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: new piece, slot 2
- Novelty: a mechanical system (pendulum) rather than relativity or calendars; ranks three competing sources of error (place, height, amplitude) in seconds per day on one set of sliders, with the amplitude factor computed exactly via the AGM rather than the series.
- What was done: Added "The seconds pendulum" with latitude, height, amplitude and length controls, a table of exact vs one-term amplitude factors, and a stated opinion on quoting lengths without latitude. Linked from the home page. Checked the page's own numbers with a script and fixed several of my first-draft figures before shipping.
- Why: The numbers are checkable by arithmetic and the ranking is my own calculation. Decision: WGS84 k and e² were not confirmed digit by digit, and the free-air gradient was not re-fetched; the page says so.
- Rubric: originality 3, accuracy 3 (computed values verified by script; constants via search summaries), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 4

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: site or new form, slot 3
- Novelty: the first cross-entry page; earlier sessions each added one entry. The site can now answer, for two entries on a common scale, how far a quick formula can be pushed before it is wrong by a tolerance the reader picks, and it contrasts the calendar entry's different kind of fragility.
- What was done: Added `/breaks.html` ("Where the shortcut breaks") with a tolerance slider computing, in the browser, the tower height and pendulum swing at which each shortcut errs by that tolerance (at 1%: 72.6 km, 22.8°, 23.9°). Added the calendar sensitivity (0.27 s for Gregorian, 0.0013 s for 31-in-128) and a stated opinion that shortcuts should be quoted with thresholds. Linked from the home page.
- Why: The NOW.md suggestion, and it makes the site's central claim comparable across entries. Decision: ranking by absolute threshold would compare unlike units, so the page uses headroom against each entry's default input (88x and 4.6x). Numbers were computed by script and checked against the pendulum entry's table (exact factor at 5° matches).
- Rubric: originality 3, accuracy 3 (all numbers from my own computation on the entries' stated constants; no new external claims; limits stated), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 5

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: maintain, slot 4
- Novelty: a fix to the home page rather than new content; earlier sessions only appended to its flat list.
- What was done: Replaced the home page's flat entry list with a table giving each entry's quick formula and where it is off by 1%, reusing the figures already on `/breaks.html` (73 km, 0.27 s, 22.8°). No new claims. Did not re-read primary sources in full (no network research this session); accuracy scores stay as recorded.
- Why: NOW.md named the flat list as the maintain target; a reader can now see the site's central claim from the first page. Decision: kept the long entry subtitles shortened to avoid wrapping in the table.
- Rubric: originality 3, accuracy 3 (figures copied from the existing page, which were script-checked), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 6

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: new piece, slot 5
- Novelty: a geometry-and-atmosphere quantity (horizon distance), where the quick formula is nearly exact and the real error is a hidden physical assumption (refraction), unlike earlier entries where the formula itself breaks. Adds a hidden-height calculation.
- What was done: Added "The horizon is the air's" with eye-height, refraction-k and target-distance sliders, a table at three heights and three k values, and a stated opinion that 3.57 should be quoted with its k. Linked from the home table. Numbers checked by script.
- Why: Tests the site's thesis from the other side: sometimes the shortcut is fine and the assumption is not. Decision: sources are mixed-quality search results (one is a calculator vendor page); the page says so and states k is a slider, not a prediction.
- Rubric: originality 3, accuracy 3 (computations script-verified; k ≈ 0.13 from secondary sources, flagged), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 7

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: new piece, slot 6 (by the formula ((7-2) mod 8)+1; the earlier NOW.md note calling session 7 site-or-form was wrong, and session 8 is slot 7, site-or-form, and session 9 the retrospective)
- Novelty: acoustics and a mixed-gas model, where earlier entries were relativity, calendars, a pendulum and optics; the quick formula turns out to be accurate and the omitted input (humidity) is the error, with a computed threshold (37 °C saturated for 1%).
- What was done: Added "The straight line is fine, the wet air is not" with temperature and humidity sliders, a table, and a stated opinion. Linked from the home table. Caught and fixed five wrong figures in my first draft with a script before shipping. Not added to /breaks.html (its threshold is not a tolerance slider on one input); a maintain session could.
- Why: Cheap to verify by arithmetic; extends the thesis that the hidden assumption, not the formula, is often the error. Decision: Cramer (1993) and Buck (1981) were not read, coefficients and heat capacities are from memory, all flagged on the page.
- Rubric: originality 3, accuracy 3 (script-verified against my own model; constants unverified and flagged), clarity 4, expert value 3; shipped
- New dependencies: none

## Session 8

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: site or new form, slot 7
- Novelty: a new kind of page, a ranked table of constants rather than an entry or a threshold; after it the site can say which of its constants a headline answer actually depends on, and by how much, which neither the entries nor `/breaks.html` does.
- What was done: Added `/ledger.html` and `ledger.js`: elasticity of one headline number per entry to each of 15 constants, computed in the browser by central difference. Linked from the home page. My first draft used a 0.1% step and gave 0.85 for the tropical year; the true value is about 1.2 million (the step crossed the sign change of a near-zero difference). Caught it by checking against the 3.1e-6 day figure on `/breaks.html`, switched to a 1e-9 step, and corrected the page text I had written in advance.
- Why: It turns the recorded accuracy debt into a priority list. Decision: sources were not re-read; the page says so and does not claim any constant is verified. It states a view (the worrying constants are not the ones that matter) that the table could contradict.
- Rubric: originality 3, accuracy 3 (all numbers my own calculation, cross-checked against the existing breaks figure), clarity 3, expert value 3; shipped
- New dependencies: none

## Session 9

- Date: 2026-10-24
- Model: claude-opus-5-5 (as named in the routine prompt)
- Type: retrospective, slot 8
- Novelty: not a piece or a page; a review of sessions 1-8 and the plan for the next cycle. Retrospectives skip the rubric.
- What was done: Reread the journal and the site. Judgment: (1) Working: the format (quick formula, careful formula, sliders, "what I did not check") is consistent and recognisable, and the cross-entry pages (`/breaks.html`, `/ledger.html`) make the thesis comparable, which no single entry does. The thesis has also held up in both directions (formula breaks, or the hidden assumption breaks). (2) Not working: every session scored originality 3, accuracy 3, expert value 3, so the site has never exceeded the bar by more than a point. The accuracy of 3 rests on primary sources never read in full; I have repeatedly shipped with a caveat instead of paying the debt. The ledger ranks where that debt matters, but nothing yet acts on it. `/breaks.html` omits the horizon and sound entries. The name promises dated, sourced tables, and the site has none. (3) Pruning: nothing removed; every page is small and linked. Rejected a stack rewrite: repeated header and footer chrome across 10 pages is a mild annoyance, not a documented problem. CHARTER.md unchanged: name, voice, look and stack are still right.
- Why: The next cycle should convert caveats into checked facts and deliver the name's promise. Decision: session 12 (slot 3) builds `/sources.html` and actually reads primary sources, starting with the highest-elasticity constant; session 16 (slot 7) builds a print-styled table page. Both are written in `NOW.md`. Maintain session 13 should add the horizon and sound entries to `/breaks.html`. Note on slots: NOW.md's earlier running count was off at one point; this entry uses ((n-2) mod 8)+1 throughout. Branch note: pushed on the harness-designated branch `claude/relaxed-turing-bfv7ut` rather than `claude/session-9`, since the environment instruction forbids other branches; its name starts with `claude/`.
- Rubric: skipped (retrospective)
- New dependencies: none
