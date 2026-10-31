"""Shared event timeline: used by BOTH the visuals (ad.js) and the sound design (audio.py)
so every notification, calendar tick and typographic hit lands exactly on its animation."""
import json, random
R = random.Random(7)
N = 120
chip_t = [round(0.02 + 2.35 * (i / (N - 1)) ** 1.55, 3) for i in range(N)]
M = 22
email_t = [round(3.30 + 4.35 * (i / (M - 1)) ** 1.35, 3) for i in range(M)]
calev_t = [round(3.55 + 3.7 * (i / 13) ** 1.1, 3) for i in range(14)]
toast_t = [5.15, 5.75, 6.3, 6.8, 7.25, 7.65]
cues = {
  "need": 0.0, "help": 0.14, "gold1": 1.40, "gold2": 1.60, "gold3": 1.80,
  "s2_in": 3.0, "stamps": [3.20, 3.45, 3.70, 3.90, 4.10, 4.30],
  "cap_a": 4.35, "cap_b": 6.0, "freeze": 8.0,
  "cards_start": 8.45, "cap3a": 9.0, "cap3b": 11.0,
  "s4_in": 12.95, "stage_b": [13.0, 14.3, 15.5, 17.2], "stack": [13.9, 15.5, 17.1],
  "s5_in": 18.85, "cap5a": 19.3, "cap5b": 20.9,
  "flash": 21.85, "word": 22.25, "headline": 22.6, "cta": 23.05,
}
json.dump({"chip_t": chip_t, "email_t": email_t, "calev_t": calev_t, "toast_t": toast_t, "cues": cues},
          open(__import__("sys").argv[1], "w"), indent=1)
