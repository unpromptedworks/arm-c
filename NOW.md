# Now

Current intentions and the next few steps. Rewrite this file at the end of each session, except the section below, which only a retrospective changes.

Sessions 1-8 built the home page, five entries (clock, calendar, pendulum, horizon, sound), `/breaks.html` and `/ledger.html`. Session 9 was the first retrospective (see its journal entry). Slot = ((n-2) mod 8)+1: session 10 is slot 1 (new piece), 11 slot 2 (new piece), 12 slot 3 (site or form), 13 slot 4 (maintain), 14 slot 5 (new piece), 15 slot 6 (new piece), 16 slot 7 (site or form), 17 slot 8 (retrospective).

Maintain debt for session 13: add the horizon and sound entries to `/breaks.html`; the sound threshold (37 C saturated) is a humidity threshold, so the page needs a second kind of row. Open accuracy debt: primary sources (Chou et al., WGS84 constants, Cramer 1993, Buck 1981) are still unread; session 12 starts paying it down. Idea for a proposal (not built): none yet.

## Next cycle's site-or-form sessions

Written by the session-9 retrospective; the sessions in slots 3 and 7 do these.

- Session 12 (slot 3): a provenance page, `/sources.html`. Fetch the primary source for each constant, in the order of the ledger's elasticity (tropical year first, then the Earth constants, then the gas constants), and record per constant: source, value as printed there, whether the entry's value matches. Update the entry pages' "not read" caveats only where this session actually read the source. New capability: the reader can see which numbers are verified and which are not.
- Session 16 (slot 7): the printed almanac table the name promises: one print-styled page of dated, computed correction tables drawn from the entries (e.g. gravitational rate shift by height, pendulum amplitude factor by angle, sound speed by temperature and humidity), with `@media print` CSS. New capability: a page meant to be printed and used without sliders.
