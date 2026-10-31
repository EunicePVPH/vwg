"""
ProVirtual PH - Business Delegation Audit Reel
Seeded timeline generator: builds the chaos -> order card choreography.
Output: timeline.js (for the renderer) and timeline.json (for the audio builder).
"""
import json, math, random, os

HERE = os.path.dirname(os.path.abspath(__file__))
rng = random.Random(2026)

PERSP = 1500.0
FREEZE = 7.0
CAM_Z = 650.0           # camera push at freeze (world z the board must cancel)
CHIP_W, CHIP_H = 300, 78
COL_X = {"KEEP": 195, "DELEGATE": 540, "STREAMLINE": 885}
CHIP_Y0, CHIP_PITCH = 690, 98

FACE_H = {"email": 124, "event": 112, "kanban": 160, "toast": 104,
          "post": 150, "doc": 196, "browser": 230, "search": 196}
PILL = {"email": "EMAILS", "event": "SCHEDULING", "post": "SOCIAL MEDIA",
        "toast": "CLIENT FOLLOW-UPS", "doc": "REPORTS", "search": "RESEARCH",
        "browser": "WEBSITE UPDATES", "kanban": "ADMIN"}

AV = ["#5B7BB0", "#C9A04A", "#36A3A3", "#8B7BE8", "#E0766B", "#3D6FD9"]

def email(frm, subj, prev, tm, color, unread=True):
    return {"from": frm, "initial": frm[0], "subject": subj, "preview": prev,
            "time": tm, "color": color, "unread": unread}
def event(title, tm, where, color):
    return {"title": title, "time": tm, "where": where, "color": color}
def kanban(tag, tagc, title, due):
    return {"tag": tag, "tagc": tagc, "title": title, "due": due}
def toast(title, sub, icon, dark=True):
    return {"title": title, "sub": sub, "icon": icon, "dark": dark}
def post(caption, when, g1, g2, fmt):
    return {"caption": caption, "when": when, "g1": g1, "g2": g2, "fmt": fmt}
def doc(title, sheet=False, lines=5):
    return {"title": title, "sheet": sheet, "lines": lines}
def browser(url, head):
    return {"url": url, "head": head}
def search(q, r1, r2):
    return {"q": q, "r1": r1, "r2": r2}

# (column, chip label, kind, chip icon, face data)
TASKS = [
 ("KEEP", "Set business goals", "kanban", "flag", kanban("STRATEGY", "#3D6FD9", "Set business goals for next quarter", "Fri")),
 ("KEEP", "Client strategy calls", "event", "users", event("Strategy call", "2:00 - 3:00 PM", "Video call", "#12306E")),
 ("KEEP", "Key partnerships", "email", "star", email("Elena Park", "Partnership opportunity - can we talk?", "Hi, I'd love to explore working together on...", "9:41 AM", AV[2])),
 ("KEEP", "Pricing decisions", "kanban", "target", kanban("DECISION", "#C9A04A", "Review service pricing", "Mon")),
 ("KEEP", "Approve final designs", "toast", "check", toast("Approval needed", "Brightwave Studio shared 3 files", "check")),
 ("KEEP", "Hiring decisions", "email", "users", email("Daniel Reyes", "Shortlist ready for your review", "Three candidates stood out. Can you take a...", "Yesterday", AV[3], False)),
 ("KEEP", "Big-picture planning", "doc", "target", doc("Annual plan - draft", False, 4)),

 ("DELEGATE", "Inbox sorting", "email", "mail", email("Maria Santos", "Re: Re: Proposal revisions", "Following up on the changes we discussed last...", "8:12 AM", AV[0])),
 ("DELEGATE", "Appointment scheduling", "event", "calendar", event("Discovery call - reschedule?", "10:30 - 11:00 AM", "Video call", "#36A3A3")),
 ("DELEGATE", "Social media posting", "post", "share", post("Behind the scenes this week", "Tue 10:00 AM", "#12306E", "#C9A04A", "Reel")),
 ("DELEGATE", "Lead follow-ups", "toast", "send", toast("New lead: Jordan R.", "Reply pending - 2 days", "bell")),
 ("DELEGATE", "Market research", "search", "search", search("competitor service pricing examples", "10 ways small teams price their services", "How to compare offers in your market")),
 ("DELEGATE", "Website updates", "browser", "globe", browser("yourbusiness.com/services", "Our Services")),
 ("DELEGATE", "Report preparation", "doc", "file", doc("Monthly report - draft", False, 5)),
 ("DELEGATE", "Data entry", "doc", "grid", doc("Client list - update", True, 5)),
 ("DELEGATE", "Content scheduling", "post", "calendar", post("5 tips for your next launch", "Thu 9:00 AM", "#3D6FD9", "#12306E", "Carousel")),
 ("DELEGATE", "Invoice reminders", "email", "mail", email("Northline Co.", "Invoice #1042 - payment reminder", "Just checking in on the invoice sent on the...", "Mon", AV[1])),

 ("STREAMLINE", "Weekly reporting", "doc", "file", doc("Weekly report - v3", False, 5)),
 ("STREAMLINE", "Client onboarding", "kanban", "repeat", kanban("ONBOARDING", "#36A3A3", "Send welcome packet to new client", "Wed")),
 ("STREAMLINE", "Email templates", "email", "mail", email("Templates", "Follow-up message - version 3", "Hi {name}, thanks for your time on...", "Tue", AV[4], False)),
 ("STREAMLINE", "Content approvals", "kanban", "check", kanban("REVIEW", "#8B7BE8", "Approve caption drafts", "Thu")),
 ("STREAMLINE", "Booking links", "event", "clock", event("Intro call - pick a time", "Any slot this week", "Video call", "#5B7BB0")),
 ("STREAMLINE", "File organizing", "toast", "file", toast("Shared drive", "14 files need sorting", "file")),
 ("STREAMLINE", "Task handoffs", "kanban", "repeat", kanban("HANDOFF", "#E0766B", "Who owns this task?", "Today")),
]

EXTRAS = [
 ("email", email("Maria Santos", "Proposal revisions - need by Friday", "Hi, could you send the updated version before...", "7:58 AM", AV[0])),
 ("email", email("Brightwave", "Question about your invoice", "Can you confirm the amount listed on the...", "8:30 AM", AV[5])),
 ("email", email("Priya Nair", "Can we move our call to 3?", "Something came up on my side, so I was...", "9:05 AM", AV[2])),
 ("event", event("Client call", "9:00 - 10:00 AM", "Video call", "#3D6FD9")),
 ("event", event("Team sync", "9:30 - 10:00 AM", "Office", "#8B7BE8")),
 ("event", event("Content review", "9:45 - 11:00 AM", "Video call", "#E0766B")),
 ("kanban", kanban("ADMIN", "#5B7BB0", "Update service page copy", "Today")),
 ("kanban", kanban("FOLLOW-UP", "#E0766B", "Reply to vendor quotes", "Tomorrow")),
 ("toast", toast("3 follow-ups overdue", "Tap to review your list", "bell")),
 ("toast", toast("Reminder: send proposal", "Due today at 5:00 PM", "clock")),
 ("toast", toast("Meeting starts in 10 min", "Strategy session", "calendar")),
 ("post", post("New offer announcement", "Fri 11:30 AM", "#C9A04A", "#08234A", "Reel")),
 ("browser", browser("yourbusiness.com/about", "About Us")),
 ("search", search("best way to organize client files", "A simple system for client folders", "Shared drives vs. cloud storage")),
]

ICON_FOR_KIND = {"email": "mail", "event": "calendar", "kanban": "check", "toast": "bell",
                 "post": "share", "doc": "file", "browser": "globe", "search": "search"}

cards = []
for col, label, kind, icon, data in TASKS:
    cards.append(dict(kind=kind, data=data, col=col, label=label, icon=icon, sorted=True))
for kind, data in EXTRAS:
    cards.append(dict(kind=kind, data=data, col=None, label=None, icon=ICON_FOR_KIND[kind], sorted=False))

small = {"toast", "email", "event", "kanban"}
pool = [c for c in cards if c["kind"] in small]
rng.shuffle(pool)
early = pool[:13]
early_ids = {id(c) for c in early}
rest = [c for c in cards if id(c) not in early_ids]
rng.shuffle(rest)
order = early + rest

# ---- spawn times + chaos pose --------------------------------------------------------
early_zones = [(-300, 300, -850, -520), (-300, 300, 520, 870), (-470, -330, -380, 380), (330, 470, -380, 380)]
for k, c in enumerate(order):
    c["id"] = k
    if k < 13:
        c["ts"] = 0.35 + 2.6 * (k / 13.0) ** 1.25
        zx0, zx1, zy0, zy1 = early_zones[k % 4]
        c["x"] = rng.uniform(zx0, zx1)
        c["y"] = rng.uniform(zy0, zy1)
        c["z"] = rng.uniform(-420, 20)
        c["s"] = rng.uniform(0.52, 0.70)
    else:
        j = k - 13
        c["ts"] = 3.05 + 3.55 * (j / 25.0) ** 0.9
        c["x"] = rng.uniform(-400, 400)
        c["y"] = rng.uniform(-780, 780)
        c["z"] = rng.uniform(-700, 140)
        c["s"] = rng.uniform(0.62, 0.98)
    c["rz"] = rng.uniform(-13, 13)
    c["rx"] = rng.uniform(-15, 15)
    c["ry"] = rng.uniform(-22, 22)
    c["vx"] = rng.uniform(-22, 22)
    c["vy"] = rng.uniform(-22, 22)
    c["swayA"] = rng.uniform(8, 24)
    c["swayF"] = rng.uniform(0.8, 1.8)
    c["swayP"] = rng.uniform(0, 6.28)
    c["rr"] = rng.uniform(-1.6, 1.6)         # deg / sec roll
    c["h"] = FACE_H[c["kind"]]
    c["pill"] = PILL[c["kind"]]

# ---- sort schedule -------------------------------------------------------------------
def proj_y(c):
    age = FREEZE - c["ts"]
    y = c["y"] + c["vy"] * age
    zt = c["z"] + CAM_Z
    return 960 + y * PERSP / (PERSP - zt)

sorted_cards = sorted([c for c in cards if c["sorted"]], key=proj_y)
col_counts = {k: 0 for k in COL_X}
for rank, c in enumerate(sorted_cards):
    c["start"] = 7.30 + rank * 0.062 + rng.uniform(0, 0.03)
    c["dur"] = 0.92
    c["land"] = c["start"] + c["dur"]
for col in COL_X:
    members = sorted([c for c in sorted_cards if c["col"] == col], key=lambda c: c["start"])
    for i, c in enumerate(members):
        c["slot"] = {"x": COL_X[col], "y": CHIP_Y0 + i * CHIP_PITCH}
    col_counts[col] = len(members)
for c in cards:
    if not c["sorted"]:
        c["fly"] = 7.28 + rng.uniform(0, 0.35)
    c["bend"] = rng.uniform(-110, 110)

tl = {
    "persp": PERSP, "freeze": FREEZE, "camZ": CAM_Z,
    "chip": {"w": CHIP_W, "h": CHIP_H},
    "colX": COL_X, "counts": col_counts,
    "cards": sorted(order, key=lambda c: c["id"]),
}
with open(os.path.join(HERE, "timeline.js"), "w") as f:
    f.write("window.TL = " + json.dumps(tl) + ";\n")
with open(os.path.join(HERE, "timeline.json"), "w") as f:
    json.dump(tl, f)
print("cards:", len(cards), "sorted:", len(sorted_cards), col_counts)
print("last spawn %.2f  first land %.2f  last land %.2f" % (
    max(c["ts"] for c in cards), min(c["land"] for c in sorted_cards), max(c["land"] for c in sorted_cards)))
