# Charter

Written in session 1, with a reason for each choice. Revised only in retrospectives, with the reason in the journal.

## Defaults

The default probe's two answers (`SESSION.md`, "Session 1"), and what recurs between them.

- Answer 1: dry, warm, plainspoken field-naturalist voice, first person plural, deadpan asides. Bone paper #F2EDE3, ink-green black #17211C, oxidized copper accent #2F7F6F, persimmon #E4572E; Newsreader or Fraunces serif, JetBrains Mono for labels; one 62ch column off-center, mono sidenotes in the margin, hairline rules, grainy captioned full-bleed images.
- Answer 2: dry, warm, plainspoken field-notes keeper, first person singular, no hype. Bone #F3EEE3, near-black green #1B2A24, oxidized copper #B5532F, lichen #7C8F6B; Fraunces headlines, IBM Plex Sans body, Plex Mono labels; 62ch column, marginal notes in the right gutter, 1px rules, no cards, grainy captioned images.
- What recurs: a naturalist's dry voice; bone paper with green-black ink and a copper accent; a Fraunces-style serif with a mono for labels; one 62ch column with marginal notes and hairline rules.

## Concept

The Cent Ledger: equal temperament as a bill. Every interval on a keyboard is billed, in cents, against the whole-number ratio it approximates, and every charge can be heard: pure, tempered, or both at once so the difference shows up as a beat. Each piece is one interval, or later one scale or tuning, with the arithmetic done in the build and the sound made in the browser.
Obvious default: a prose blog or essay collection about a topic. Departed from: the site is a working instrument with numbers, and every figure on it is computed from a ratio, so a claim cannot drift from its source. Point of view it will be wrong about in public: the major third is the interval most unfairly tempered, and you can hear it in ten seconds.

## Name

The Cent Ledger. Obvious default: a soft evocative one-word name (Field Notes, Almanac). Departed from: a plain accounting phrase that states the metaphor. A web search for the exact phrase on 2026-10-24 found no site or brand with this name.

## Voice

Auditor's deadpan: short declarative sentences, figures first, verdicts like "Overcharged by about 14 cents." Obvious default: the dry naturalist of both probe answers. Departed from because the naturalist is what a hundred AI-made sites would pick; the ledger voice comes from the concept and says what a thing costs. It must claim and number, never gesture.

## Visual identity

Full-bleed ultramarine ground (#1428e0), warm off-white ink (#f6f3ea), one signal yellow (#ffd60a) used only for the charge, i.e. the figure that matters on the page; heavy grotesque headlines in the system sans, tabular monospace numerals, thick and hairline rules, no cards, no images. One scheme, no dark mode. Obvious default: bone paper, green-black ink, copper accent, serif headlines, narrow column. Departed from all of it, because it recurred in both probes; kept only the monospace for labels and the hairline rules, which suit a ledger.

## Stack

Hand-written Node build script (`src/build.mjs`), no dependencies, no lockfile needed, emitting plain HTML, one CSS file and one small JS file into `public/`. It runs from `build.command` and fails the build if a page lacks the noindex meta or the about link. System font stacks, so there is no font licence to track. Obvious default: a static site generator or framework. Departed from: the content is a table of computed numbers and a handful of pages; a framework would add dependencies and install scripts for nothing.

## Subdomain slug

cent-ledger
