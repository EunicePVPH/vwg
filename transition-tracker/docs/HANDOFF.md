# Transition Tracker: Handoff Notes

Prototype v0.1 for "Helping Grade 4 Adapt: Improving Classroom Routines to Save Learning Time Using Transition Tracker" (San Jose Central School).

## 1. What is in the package

1. `transition-tracker-site.zip`: the finished website, ready to upload to Netlify.
2. `transition-tracker-source.zip`: the full source code for continuing in Claude Code on desktop.
3. This notes file.

## 2. Put it on Netlify (easiest way)

1. On a laptop, open https://app.netlify.com/drop and sign in to your Netlify account.
2. Unzip `transition-tracker-site.zip` into a folder. Drag the folder onto the page, or drop the zip file itself.
3. Netlify gives you a web address. In Site settings, change the site name to something you will keep.
4. Open the address on the laptop and on the Android phone. Both need internet for the first visit.

Why a final address matters: saved records belong to the address they were made on. If the address changes later, the records will not appear at the new one. Choose the final site name before real data collection.

Other way, from GitHub: connect the repo `EunicePVPH/vwg`, branch `ccr-8b1067b4-jbng8n`, set Base directory to `transition-tracker`. The build command is `npm run build` and the publish directory is `dist`. A `netlify.toml` file is included.

## 3. Checks to do after it is online

1. Open the link on the school laptop. In Chrome or Edge, use the install icon in the address bar to install it.
2. Turn off Wi-Fi, close and reopen the app. Does it still open? Does the timer work?
3. Start a transition, press Class Ready, close the browser, reopen it. Is the record still in Research?
4. Connect the laptop to the TV or projector. Check the classroom display from the back of the room.
5. Turn sound on and check the chime on the classroom speakers.
6. On the phone, open the link in Chrome and use "Add to Home screen". Repeat checks 2 and 3.
7. Export a JSON backup on one device and restore it on the other.

Until these are done, the app says "Not tested yet" in Settings. That is on purpose.

## 4. Choices made for the prototype (placeholders, not approved)

1. Readiness: 85% of pupils present (your number).
2. Posttest: with the pupil display.
3. Pairing for the t-test: same routine, matched in order (1st baseline with 1st posttest).
4. Paused, interrupted or reloaded timings: flagged "Needs review" and not counted until confirmed.
5. Time-saved estimate: needs at least 3 valid baseline and 3 valid posttest records of the same routine.
6. Targets: Switching Subjects 2:00, Cleaning and Packing Up 3:00, Recess 3:00, Groups/Lining Up 2:00.
7. The app starts in the Intervention phase so the first screen shown is the classroom display.

A blue banner on the Research page says these are prototype defaults. Press "These are final" once your adviser approves them.

Things that need the adviser's approval before real data: items 1, 2 and 3 above.

## 5. How I read the brief (my best interpretation)

1. **Start and end of a transition.** Start is when the teacher presses Start (when pupils are told to change activities). End is when the teacher presses Class Ready. The countdown and the stopwatch are separate. The countdown is only a target for pupils. The stopwatch never stops at zero. Target 2:00 and ready at 3:20 stores 200 seconds.
2. **Readiness.** The brief does not say what "most pupils ready" means, so there is no hidden default in the app. The teacher enters a percent or a number, confirms it, and it is saved with every observation. Real recording is blocked until then. Demo Mode skips this.
3. **Baseline.** A plain, teacher-only stopwatch. No steps, ring, colors, sound or celebration is shown to pupils.
4. **Posttest.** The brief does not say whether pupils see the tracker, so the teacher must choose. Each record is tagged with what was used.
5. **What counts.** Only "Valid" and "Manual entry" records are used in means, SDs, charts and estimates. Interrupted, Excluded and Needs review records are kept but not counted.
6. **Pauses.** A pause is not counted as transition time, but the record is flagged for review, because a paused transition is a judgment call for the researcher.
7. **Page reload during timing.** The clock continues from the saved start time, but the record is flagged for review rather than trusted silently.
8. **Corrections.** A change to duration, status or phase needs a reason. The original value and a history of changes are kept. Records are never silently deleted. Use "Excluded" instead.
9. **Manual entry.** Allowed for verified observations, always marked "Manual entry" and needs a source note.
10. **Routine edits.** Each observation stores its own copy of the routine, so later edits do not change old records.
11. **Statistics.** Sample standard deviation (n - 1) from raw seconds. The minutes:seconds format is only for display. Pooled results across routines show a warning, and a single-routine view is offered.
12. **t-test.** Withheld unless a pairing rule is chosen and marked as approved by the adviser. In Demo Mode only, approval is assumed so the test can be previewed, labelled as sample data.
13. **Time saved.** Baseline mean minus posttest mean, per routine, only for routines with enough records. Always labelled an estimate of transition time, not learning gains.
14. **Demo vs real.** Demo data is generated, stored separately, flagged, and labelled "DEMONSTRATION DATA — NOT ACTUAL RESEARCH RESULTS" on every panel and in exports. It cannot be imported into real records.
15. **Offline.** The app is built as an installable offline app. Records are saved in the browser on each device, so laptop and phone do not sync. Use the JSON backup to move them.
16. **Design.** Navy sidebar and light workspace for the teacher. A dark navy, high-contrast screen for the projector. Plain CSS and hand-drawn charts were used instead of Tailwind and Recharts, to keep it light and offline-friendly.

## 6. What works, what is not tested, what is not built

Works (tested in a browser):
- Routines, classroom display, baseline stopwatch, Start, Pause, Class Ready, Cancel, Restart.
- Saving records, refresh persistence, filters, corrections, manual entry.
- Charts, statistics, CSV and JSON export, backup restore with duplicate protection.
- Demo Mode with separate data, no horizontal scroll on phone and projector sizes.
- Unit tests for the timer, statistics and t-test (17 passing).

Not tested on the real devices:
- Offline use and installing on the school laptop and Android phone.
- Data after closing the browser or clearing storage.
- Projector or Smart TV layout and classroom speakers.

Not built:
- Sync between devices (use JSON backup).
- Native Excel .xlsx (the CSV opens in Excel).
- Multiple teachers, classes or accounts, and a Filipino language option.

## 7. Before December 1

1. Get adviser approval for the readiness rule, posttest procedure and pairing rule, then replace the prototype defaults.
2. Set the real target times and check the routine steps.
3. Deploy to the final Netlify address and run the checks in section 3.
4. Do a practice run with the real class setup. Export a backup after each session.

## 8. Where things are in the code

- `src/lib/timer.ts`: timer logic.
- `src/lib/stats.ts`: statistics and t-test.
- `src/lib/db.ts`: saving to the device.
- `src/lib/csv.ts` and `src/lib/backup.ts`: exports and restore.
- `src/store.tsx`: app state and the research rules.
- `src/components/`: the screens.

Run it: `npm install`, then `npm run dev`. Test: `npm test`. Build: `npm run build`.
