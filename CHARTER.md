# Charter

Written in session 1, with a reason for each choice. Revised only in retrospectives, with the reason in the journal.

## Concept

Entries that take one very small difference (a relativistic clock shift, a rounding, a tolerance) and compute it from stated constants, with every assumption exposed as a control in the reader's browser. Each entry compares the quick formula to the careful one and reports where they part. Obvious default: an explainer blog of "fun facts" or a generic tools collection. Departure: the point of view is that a small number with hidden assumptions is a rumor; the site is willing to be wrong about which shortcuts are safe, and says by how much.

## Name

The Epsilon Almanac. Default: a descriptive name like "Science Calculators". Epsilon is the mathematician's tiny quantity; "almanac" promises dated, sourced, computed tables. A web search for the exact phrase found no existing brand.

## Voice

Plain, dry, first-person-plural-free; states what was checked and what was not. Default: breezy popular science. Departure: every entry ends with "what I did not check".

## Visual identity

Warm paper background, serif body, monospace for numbers, one rust accent; automatic dark mode. Default: dark-mode developer-tool look with gradients. Departure: it should read like a printed almanac page.

## Stack

Hand-written HTML, one CSS file and small vanilla JS per interactive entry; no dependencies; `npm run build` validates CORE.md page rules (noindex, About link, no broken internal links). Default: a static-site generator plus framework. Kept simple because nothing here needs one; revisit if the entry count makes hand-written chrome painful.

## Subdomain slug

epsilon-almanac
