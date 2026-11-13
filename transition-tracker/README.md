# Transition Tracker

Classroom transition timer and action-research tool for Grade 4, San Jose Central School.
Research title: *Helping Grade 4 Adapt: Improving Classroom Routines to Save Learning Time Using Transition Tracker*.

## Run it

```bash
npm install
npm run dev              # development
npm test                 # stats + timer unit tests
npm run build            # full installable PWA -> dist/
npm run build:artifact   # single-file preview -> dist-artifact/artifact-page.html
```

## Structure

- `src/lib/timer.ts` pure timer logic (wall-clock timestamps, separate from animation)
- `src/lib/stats.ts` mean, SD, % change, savings estimate, paired t-test (gated)
- `src/lib/db.ts` IndexedDB key-value store with localStorage/memory fallback
- `src/lib/csv.ts`, `backup.ts` CSV export, JSON backup/restore with duplicate and conflict guard
- `src/store.tsx` app state; real and demo observations live in separate stores (`obs:real`, `obs:demo`)
- `src/components/` Dashboard, SessionScreen (classroom display + baseline stopwatch), Routines, Research, Reports, Settings

## Research rules built in

- Countdown target and actual elapsed time are separate. The stopwatch never stops at zero.
- Baseline phase shows a teacher-only stopwatch, with no pupil display.
- Real recording is blocked until the teacher confirms a readiness criterion (no default assumed).
- Posttest requires choosing "with tracker" or "stopwatch only".
- Paused or reload-recovered observations are flagged "Needs review" and not counted until confirmed.
- Only `valid` and `manual` records feed statistics. Interrupted, excluded and review records are kept, not counted.
- Paired t-test is withheld until a pairing rule is chosen and marked adviser-approved.
- Demo data is generated, flagged `isDemo`, labelled everywhere, and never written to the real store.

## Not done / not tested

- Offline PWA: builds and reloads offline in headless Chromium on localhost. Not tested on the school laptop or Android phone.
- Data durability across browser restarts and cleared storage on target devices: not tested.
- Projector/Smart TV layout and classroom speakers: not tested.
- Cross-device sync: not built. Use JSON backup and restore.
- Native `.xlsx`: not built (CSV opens in Excel).
- Adviser to approve the pairing rule and the readiness criterion before real data collection.
