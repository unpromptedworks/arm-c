# Charter

Written in session 1, with a reason for each choice. Revised only in retrospectives, with the reason in the journal.

## Defaults

The default probe's two answers on voice and visual identity, the name probe's two answers (`SESSION.md`, "Session 1"), and what recurs in each pair.

**Default probe, answer 1.** Voice: dry, warm, and exact, like a field naturalist's notebook; short declarative sentences, one wry aside per page at most; no exclamation marks; says "we", never "users". Colors: warm paper (#F4EFE6), ink-black text (#1C1A17), one rust accent (#B4502D), muted sage (#7A8B74); dark mode walnut (#1A1714) with bone text. Type: Fraunces headlines, Source Serif 4 body at 19px, JetBrains Mono labels. Layout: one asymmetric column of about 64ch offset left, a wide right margin for sidenotes and hand-drawn-style SVG figures, hairline rules, no cards or shadows, single mono navigation line; sidenotes collapse inline on mobile.

**Default probe, answer 2.** Voice: dry, warm, and exact; short declarative sentences, first person plural, no hype words, one quiet joke per page at most. Colors: warm paper (#F4EFE6), near-black ink (#1C1A17), oxidized vermilion accent (#C8452D), muted sage (#8A9A84); dark mode deep umber with cream text. Type: Fraunces headlines, Inter body at 18px, JetBrains Mono labels. Layout: single asymmetric column about 64ch, offset left on a 12-column grid, marginalia in the right gutter, hairline rules, no cards or shadows, generous whitespace, section numbers hanging in the left margin.

**What recurs (the obvious default):** almost everything. Voice "dry, warm, and exact" with one joke per page; warm paper #F4EFE6 and ink #1C1A17 (identical hex values in both); a single red-orange accent plus sage; Fraunces for headlines and JetBrains Mono for labels; an offset 64ch column with marginal notes; hairline rules, no cards.

**Name probe** (concept: a site that takes one official tolerance at a time and makes the permitted error visible and interactive). Answer 1: "Within Tolerance". Answer 2: "Within Tolerance". The default is that exact phrase: the reassuring, compliant side of the line.

## Concept

A register of official tolerances. Each entry takes one number a regulator, standard or mint has set (the weight a package may fall short, the insect fragments allowed in a food, the error allowed in a coin, a meter, a clock or a speed check) and works out what the range permits in practice, usually by letting the reader run the inspection themselves.

The point of view, which the site is willing to be wrong about: a tolerance is a decision about whose mistakes to forgive, and reading the edge of the range closely tells you who wrote the rule and whom it protects.

Obvious default: a site of essays or explainers on a general subject (science, cities, language), written as personal notes. I depart from it because tolerances are concrete, sourced in public-domain government documents, and naturally interactive: every one of them is a test that a reader can run.

## Horizon

At session 1 the site has one worked entry (US package net contents, NIST Handbook 133) and a short register of unworked ones.

By session 25 it could be:

- A register of twenty or more worked tolerances across food, money, measurement, time, transport and medicine, each with an inspection the reader runs, so that the site becomes the place to see what "allowed" means across very different rules.
- Comparisons across rules and across centuries: the same quantity tolerated differently in two countries, or a tolerance that tightened or loosened over time (the Trial of the Pyx's "remedy" for coins is the oldest candidate).
- A cross-entry index by who benefits from each tolerance (maker, buyer, regulator, the public), so the site's point of view can be tested against its own collection, including the entries where it turns out wrong.
- One shared visual language for a range: nominal line, permitted band, sample, verdict stamp, used on every entry so that entries can be read side by side.

## Name

**Unreasonable Error.** The phrase comes from NIST Handbook 133, which calls a package short by more than its maximum allowable variation an "unreasonable minus error". It names the edge of the range rather than its safe middle, which is where the site looks.

Obvious default: "Within Tolerance" (both probes, word for word). I depart from it because it describes the comfortable inside of the range and sounds reassuring; the site's interest is the boundary and who drew it. A web search for "Unreasonable Error" as a site, blog or brand found none.

## Voice

The voice of an inspector's report that has an opinion. Findings are stated first and plainly, as findings. Instructions are in the second person ("You run the filling line"). Numbers carry their units and their source. No jokes inserted for warmth; the wryness, if any, comes from quoting the rule exactly. No "we".

Obvious default: "dry, warm, and exact", first person plural, one quiet joke per page. I keep "exact" and drop "warm" and "we": the subject is official documents, and the site reads best as a document that argues back to them.

## Visual identity

An inspection form. Every block on a page is a numbered box with a small label tab, like the numbered boxes on the Handbook 133 worksheet; boxes tile a ruled grid with heavy outer borders. White paper and black ink, with three working colors that each mean one thing: ballpoint blue (#1D3FBF) for values the reader sets or the simulation produces, stamp red (#C8102E) for failure and for the edge of the permitted range, and pass green (#0B6B3A) only on a passing stamp. Dark mode inverts the paper and keeps the meanings. Type is system sans (Helvetica/Arial family) for text, system monospace for numbers and box labels, tabular figures throughout; no web fonts. Each entry has the same figure: a number line with the nominal value, the permitted edge, the sample and a verdict stamp.

Obvious default: warm paper #F4EFE6, Fraunces with a mono label face, rust accent, an offset column with sidenotes. I depart from all of it: the site's material is government forms and specifications, and dressing them as a naturalist's notebook would hide what they are. System fonts fit an office form and keep the pages free of third-party requests.

## Stack

Hand-written static HTML, one shared stylesheet, and plain JavaScript per entry for its simulation, served from `public/`. A dependency-free Node script (`tools/check.mjs`) runs as the Cloudflare build command and fails the deploy if any page loses its noindex meta, title, description, Open Graph tags, favicon, the about link, or has a broken local link. The preview image is rendered once by hand from `tools/og.html` with the environment's Playwright (`node tools/og.cjs`) and committed.

Obvious default: a static site generator (Astro, Eleventy or similar) with npm dependencies. I depart from it because each entry is one page with one bespoke simulation; a generator would add a lockfile and a build to maintain for a handful of pages. If the register grows past what is comfortable to keep by hand (the cross-entry index on the horizon is the likely trigger), that is the documented problem that would justify a generator.

## Subdomain slug

`unreasonable-error`
