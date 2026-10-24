# Session instructions

Make a website. Do whatever you want with it.

This repository is your only memory between sessions: each session starts by reading it and ends by updating it. `CORE.md` holds the rules every session follows, including the distinctiveness rules.

Merge policy: AUTO

## Every session

1. Read `CORE.md`, `CHARTER.md`, the last several entries of `JOURNAL.md`, `NOW.md` and `EDITOR.md`.
2. Check for an open pull request from an earlier session: `gh api "repos/OWNER/REPO/pulls?state=open"`, with OWNER/REPO taken from `git remote get-url origin`. Count only pull requests whose head branch starts with `claude/`. If one is open, open no second one. Under merge policy REVIEW, end the session without changes. Under AUTO, merge it if its check run passed (see step 10); otherwise this session's change is fixing its build, on the same branch.
3. Your session number is the last journal entry's number plus one. If the journal has no entries, this is session 1: also follow "Session 1" below. Otherwise, find this session's type from "Session cycle" below.
4. Choose one focused change for this session, of this session's type.
5. Novelty check: before starting, write down how this work differs from the work of recent sessions; in a site-or-form session, also what the site will be able to do afterward that it can't now. If it doesn't differ, choose again. The answer goes in the journal entry.
6. Make the change. Research on the web as needed.
7. Build the site; the build must pass.
8. Self-critique: score the change against "Rubric" below. If it is below the bar, go back to step 6 and improve it, or save it as a draft and don't ship it.
9. Add a journal entry, using the template in `JOURNAL.md`, and update `NOW.md`.
10. Commit to a new branch named `claude/session-N`, push it, and open a pull request with the REST API: `gh api repos/OWNER/REPO/pulls -f title="..." -f head=claude/session-N -f base=main -f body="..."`. `gh pr` does not work in this environment. The description says what you did and what comes next.
11. Under merge policy REVIEW, stop here and never merge your own pull request; the operator merges. Under AUTO, wait for the Cloudflare check run on the head commit (`gh api repos/OWNER/REPO/commits/SHA/check-runs`) to finish; if no check run appears within 10 minutes of the push, push an empty commit once to start the build again. If it succeeds, merge with `gh api -X PUT repos/OWNER/REPO/pulls/NUMBER/merge -f merge_method=squash`. If it fails, fix and push once; if it fails again, leave the pull request open and say so in its description.

No one reads this session while it runs. Never wait for an answer: decide, record the decision and its reason in the journal, and continue.

## Session cycle

After session 1, sessions follow a fixed cycle of eight. The type comes from the session number; never choose or change it. Slot = ((session number - 2) mod 8) + 1, so session 2 is slot 1, session 9 is slot 8, and session 10 starts the next cycle at slot 1.

| Slot | Type | What it does |
| --- | --- | --- |
| 1, 2, 5, 6 | New piece | More content of a kind the site already has |
| 3, 7 | Site or new form | A change to the site itself (structure, navigation, design, a tool, an index) or a kind of content the site doesn't have yet. If the last retrospective chose what this session does, do that |
| 4 | Maintain | Fixes, refactors, broken links, improving an old piece |
| 8 | Retrospective | See "Retrospective" below |

Change the site's name, voice or visual identity, or `CHARTER.md`, only in a retrospective.

## Rubric

Score what a reader sees after the change (the new piece, the new feature, or, in a maintain session, the piece you improved) from 1 to 5 on each:

- Originality: does it contribute something not on the first page of a web search?
- Accuracy: are its factual claims checked against cited sources? Score n/a only if it makes no factual claim, and say why in the journal.
- Clarity: would a newcomer follow it without help?
- Expert value: would a curious expert learn something from it?

The bar is 3 or more on every score. A draft goes in `drafts/` at the repository root, outside the published output, and nothing on the site links to it; a later session may finish it. A fix that only repairs something broken ships whatever its scores. Retrospectives skip the rubric. The scores are a record of your process, not a review.

## Retrospective

Reread the whole journal and the site. Judge what is working and what isn't, and write that judgment in the journal entry. Prune what isn't working: remove it or rework it. Choose what the next cycle's two site-or-form sessions (slots 3 and 7) will do, and write them in `NOW.md`. You may revise `CHARTER.md`, including the name, voice and visual identity; record each revision and its reason in the journal.

## Session 1

Choose the site's concept, name, voice, visual identity and stack, and write them into `CHARTER.md` with your reasons; for each one, name the obvious default and say why you depart from it or keep it. Replace the placeholder in `public/` with the first version of the site; if your build writes somewhere else, point `wrangler.jsonc` there and keep the `_headers` file in the output.

Session 1 has no type and skips the novelty check. It still scores the first version against the rubric; below the bar, improve it rather than saving a draft, since the site needs a first version.

Propose a subdomain slug in `CHARTER.md` and in the pull request: lowercase letters, digits and hyphens; not a real brand, a person's name, or a reserved name such as `www`, `mail` or `admin`. The operator maps it to `SLUG.unpromptedworks.com` after the pull request merges.
