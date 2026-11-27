// Printable handbook. Built entirely on this device (works offline); nothing is uploaded.
// Pages are half-letter (5.5 x 8.5 in = 396 x 612 pt). They are then IMPOSED onto US Letter landscape sheets (792 x 612 pt)
// in booklet order, to be printed double-sided (flip on the SHORT edge), stacked, folded in half and stapled at the fold.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import type { Activity, Day, Flight, Hotel, Ticket } from '../types';
import type { DayItem, FinalItem } from './packTypes';
import type { Gate } from '../data/gates';

export const PW = 396, PH = 612, LW = 792;
const M_TOP = 40, M_BOT = 50, M_IN = 52, M_OUT = 34;

export interface BookletInput {
  acts: Activity[]; days: Day[]; tickets: Ticket[]; flights: Flight[]; hotel: Hotel;
  dayItems: DayItem[]; finals: FinalItem[]; gates: Gate[];
  budget: { label: string; value: string }[] | null; // null = leave the money page out
  emergency: { label: string; phone?: string; note?: string }[];
  generated: string;
  routeChoice?: Record<string, string>; // activity id -> alternative route id you selected in the app
  keyAddresses?: { name: string; zh?: string; addr: string; note?: string }[];
  zhPng?: (text: string) => Promise<Uint8Array | null>; // draws Chinese text with the phone's own font (standard PDF fonts cannot)
}

// Standard PDF fonts only support WinAnsi, so special characters are mapped to plain equivalents.
const MAP: Record<string, string> = { '₱': 'PHP ', '→': '->', '←': '<-', '≈': '~', '✓': 'x', '⚠': '!', '★': '*', '·': ' - ', '…': '...', ' ': ' ', '‑': '-', '≥': '>=', '≤': '<=' };
export const ascii = (s: string) => s.replace(/[₱→←≈✓⚠★·… ‑≥≤]/g, (c) => MAP[c] ?? '').replace(/[^\x20-\x7E\xA1-\xFF‘’“”–—•]/g, '');
const fmt12 = (t: string) => { const [h, m] = t.split(':').map(Number); return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`; };
const dur = (a: string, b?: string) => { if (!b) return ''; const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); const d = h2 * 60 + m2 - (h1 * 60 + m1); return d > 0 ? ` (${d >= 60 ? `${Math.floor(d / 60)}h${d % 60 ? ` ${d % 60}m` : ''}` : `${d}m`})` : ''; };
const dateTxt = (iso: string) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso + 'T12:00:00Z'));

class Writer {
  doc!: PDFDocument; reg!: PDFFont; bold!: PDFFont; ital!: PDFFont;
  pages: PDFPage[] = []; page!: PDFPage; y = 0;
  marks: Record<string, number> = {}; zhCache = new Map<string, PDFImage | null>();
  mark(k: string) { this.marks[k] = this.n; }
  /** One line of Chinese, drawn from an image made by the phone (skipped silently when no image maker is available). */
  async zh(t: string, png?: (t: string) => Promise<Uint8Array | null>, size = 10) {
    if (!png || !t) return;
    if (!this.zhCache.has(t)) { try { const b = await png(t); this.zhCache.set(t, b ? await this.doc.embedPng(b) : null); } catch { this.zhCache.set(t, null); } }
    const im = this.zhCache.get(t); if (!im) return;
    const sc = Math.min(size / im.height, (this.w - 14) / im.width); const h = im.height * sc;
    this.need(h + 3); this.page.drawImage(im, { x: this.x0 + 12, y: this.y - h, width: im.width * sc, height: h }); this.y -= h + 3;
  }
  /** Bold day divider: a solid band across the top of the page. */
  banner(big: string, small: string) {
    this.page.drawRectangle({ x: 0, y: PH - 74, width: PW, height: 74, color: rgb(0.07, 0.16, 0.3) });
    this.page.drawText(ascii(big), { x: this.x0, y: PH - 40, size: 21, font: this.bold, color: rgb(1, 1, 1) });
    this.page.drawText(ascii(small), { x: this.x0, y: PH - 60, size: 9.5, font: this.reg, color: rgb(1, 0.78, 0.24) });
    this.y = PH - 90;
  }
  async init() { this.doc = await PDFDocument.create(); this.reg = await this.doc.embedFont(StandardFonts.Helvetica); this.bold = await this.doc.embedFont(StandardFonts.HelveticaBold); this.ital = await this.doc.embedFont(StandardFonts.HelveticaOblique); }
  get n() { return this.pages.length; }
  get x0() { return this.n % 2 === 1 ? M_IN : M_OUT; } // odd = right-hand page: inner (binding) margin on the left
  get x1() { return PW - (this.n % 2 === 1 ? M_OUT : M_IN); }
  get w() { return this.x1 - this.x0; }
  newPage(numbered = true) {
    this.page = this.doc.addPage([PW, PH]); this.pages.push(this.page); this.y = PH - M_TOP;
    if (numbered && this.n > 1) { const t = `- ${this.n} -`; const sz = 8; this.page.drawText(t, { x: PW / 2 - this.reg.widthOfTextAtSize(t, sz) / 2, y: 22, size: sz, font: this.reg, color: rgb(0.35, 0.35, 0.35) }); }
  }
  need(h: number) { if (this.y - h < M_BOT) this.newPage(); }
  wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const out: string[] = [];
    for (const para of ascii(text).split('\n')) {
      let line = '';
      for (let word of para.split(' ')) {
        while (font.widthOfTextAtSize(word, size) > maxW) { let k = word.length; while (k > 1 && font.widthOfTextAtSize(word.slice(0, k), size) > maxW) k--; if (line) { out.push(line); line = ''; } out.push(word.slice(0, k)); word = word.slice(k); }
        const t = line ? line + ' ' + word : word;
        if (font.widthOfTextAtSize(t, size) <= maxW) line = t; else { if (line) out.push(line); line = word; }
      }
      out.push(line);
    }
    return out;
  }
  text(t: string, o: { size?: number; font?: PDFFont; indent?: number; gap?: number; color?: [number, number, number]; width?: number } = {}) {
    const size = o.size ?? 9, font = o.font ?? this.reg, lh = size * 1.28, indent = o.indent ?? 0;
    const lines = this.wrap(t, font, size, (o.width ?? this.w) - indent);
    for (const ln of lines) { this.need(lh); this.page.drawText(ln, { x: this.x0 + indent, y: this.y - size, size, font, color: rgb(...(o.color ?? [0, 0, 0])) }); this.y -= lh; }
    this.y -= o.gap ?? 0;
  }
  h1(t: string) { this.need(40); this.text(t, { size: 17, font: this.bold, gap: 4, color: [0.07, 0.16, 0.3] }); this.rule(); }
  h2(t: string) { this.need(70); this.y -= 4; this.text(t, { size: 11.5, font: this.bold, gap: 2, color: [0.07, 0.16, 0.3] }); }
  rule() { this.page.drawLine({ start: { x: this.x0, y: this.y }, end: { x: this.x1, y: this.y }, thickness: 0.7, color: rgb(0.7, 0.7, 0.7) }); this.y -= 7; }
  box(x: number, y: number, s = 7) { this.page.drawRectangle({ x, y: y - s + 1, width: s, height: s, borderWidth: 0.8, borderColor: rgb(0.2, 0.2, 0.2) }); }
  check(t: string, size = 8.5) { const lines = this.wrap(t, this.reg, size, this.w - 14); const lh = size * 1.28; this.need(lines.length * lh + 2); this.box(this.x0, this.y - 1, 7); lines.forEach((ln, i) => { this.page.drawText(ln, { x: this.x0 + 13, y: this.y - size - i * lh + 1, size, font: this.reg }); }); this.y -= lines.length * lh + 2.5; }
  /** Two-column checklist to save pages. */
  checkCols(items: string[], size = 8) {
    const colW = (this.w - 10) / 2; const lh = size * 1.28;
    const blocks = items.map((t) => this.wrap(t, this.reg, size, colW - 12));
    const total = blocks.reduce((n, b) => n + b.length, 0); let acc = 0; let split = blocks.length;
    for (let i = 0; i < blocks.length; i++) { acc += blocks[i].length; if (acc >= total / 2) { split = i + 1; break; } }
    const cols = [blocks.slice(0, split), blocks.slice(split)]; const h = Math.max(...cols.map((c) => c.reduce((n, b) => n + b.length * lh + 2.5, 0)));
    this.need(Math.min(h, 200)); const top = this.y;
    cols.forEach((c, ci) => { let yy = top; const x = this.x0 + ci * (colW + 10); for (const b of c) { if (yy - b.length * lh < M_BOT) break; this.box(x, yy - 1, 6.5); b.forEach((ln, i) => this.page.drawText(ln, { x: x + 11, y: yy - size - i * lh + 1, size, font: this.reg })); yy -= b.length * lh + 2.5; } });
    this.y = Math.max(M_BOT, top - h) - 2;
  }
  lines(n: number) { for (let i = 0; i < n; i++) { this.need(16); this.page.drawLine({ start: { x: this.x0, y: this.y - 12 }, end: { x: this.x1, y: this.y - 12 }, thickness: 0.4, color: rgb(0.75, 0.75, 0.75) }); this.y -= 16; } }
}

const TAGS: Record<Activity['status'], string> = { confirmed: '[CONFIRMED BY USER]', planned: '[PLANNED]', optional: '[OPTIONAL]', estimated: '[ESTIMATE]', verify: '[VERIFY OFFICIAL SOURCE]', pending: '[PENDING]', paid: '[PAID]' };
const TAG = (s: Activity['status']) => TAGS[s] ?? '';
const CAR = 'CHILD CAR SEAT: choose "Car Seat (1-7yo)" in Uber and check the seat is in the car before Aya gets in. Never carry Aya on a lap.';
const modeOf = (a: Activity) => a.mode === 'uber' || a.mode === 'car';
const ARROW = (list: string[]) => list.join('  ->  ');

type Pass = { bytes: Uint8Array; marks: Record<string, number> };
async function buildOnce(d: BookletInput, idx: Record<string, number>): Promise<Pass> {
  const W = new Writer(); await W.init();
  const pg = (k: string) => (idx[k] ? String(idx[k]) : '--');
  const DAYS_ALL = d.days;
  // ---- cover ----
  W.newPage(false);
  W.page.drawRectangle({ x: 0, y: PH - 190, width: PW, height: 190, color: rgb(0.07, 0.16, 0.3) });
  W.page.drawText('HONG KONG 2026', { x: M_IN, y: PH - 80, size: 30, font: W.bold, color: rgb(1, 1, 1) });
  W.page.drawText('Our Family Adventure', { x: M_IN, y: PH - 108, size: 14, font: W.reg, color: rgb(1, 0.78, 0.24) });
  W.page.drawText('Keren - Gilbert - Aya', { x: M_IN, y: PH - 132, size: 11, font: W.reg, color: rgb(1, 1, 1) });
  W.page.drawText('December 7-11, 2026', { x: M_IN, y: PH - 152, size: 11, font: W.reg, color: rgb(1, 1, 1) });
  W.y = PH - 225;
  W.text('Itinerary & directions handbook - Nov 27 plan', { size: 11, font: W.bold, gap: 2 });
  W.text('How to read the labels:', { size: 9, font: W.bold });
  W.text('[CONFIRMED BY USER] you told us it is booked or agreed.\n[PLANNED] the plan - nothing is booked unless it says so.\n[OPTIONAL] skip freely.\n[ESTIMATE] a planning number, not official.\n[VERIFY OFFICIAL SOURCE] check the official page or your own booking first (exits, fares, hours, show times).', { size: 8.3, indent: 8, gap: 4 });
  W.text('Quoted Uber prices are quotes only - not booked and not paid. Nothing in this booklet knows where you are: it never tracks your location.', { size: 8.3, gap: 6 });
  W.text('Hotel: Rambler Oasis Hotel, 1 Tsing Yi Road, Tsing Yi, Hong Kong', { size: 9, font: W.bold });
  W.text(`Hotel phone: ${d.hotel.phone}`, { size: 9, gap: 6 });
  W.text('Hong Kong and the Philippines are both UTC+8: no time change.', { size: 9, gap: 6 });
  W.text('Luggage plan: ONE 28-inch suitcase, ONE 20-inch suitcase, ONE backpack, ONE compact foldable stroller.', { size: 8.5, gap: 6 });
  W.text('Private: this booklet lists booking details. It never contains passport numbers or ticket QR codes - keep the originals in the app. Do not post it publicly.', { size: 8, font: W.ital, color: [0.35, 0.35, 0.35], gap: 6 });
  W.text(`Generated ${d.generated} on this phone`, { size: 8, color: [0.35, 0.35, 0.35] });

  // ---- how to print ----
  W.newPage(); W.h1('How to print & fold');
  W.text('This booklet is laid out for US Letter paper (8.5 x 11 in), printed double-sided, folded in half to a 5.5 x 8.5 in handbook.', { size: 9, gap: 5 });
  ['Print the "Print sheets (Letter)" PDF - not the reading-order one.', 'Paper: US Letter. Orientation: LANDSCAPE.', 'Scale: 100% / Actual size. Do NOT choose "Fit to page" or "Shrink".', 'Double-sided: flip on the SHORT edge.', 'Stack the sheets in order, fold in half, staple at the fold.'].forEach((t, i) => W.text(`${i + 1}. ${t}`, { size: 9, indent: 4 }));
  W.y -= 6; W.text('Reading-order PDF', { size: 10, font: W.bold }); W.text('The other PDF shows the pages in normal order (1, 2, 3...) at half-letter size. Use it to read on a screen or to print and bind a different way.', { size: 8.5, gap: 4 });
  W.text('Offline: everything in this booklet works without internet. Navigation links, Uber prices and live service alerts do not.', { size: 8.5, font: W.ital });

  // ---- index ----
  W.newPage(); W.h1('Index');
  const entries: [string, string][] = [['Emergency quick reference', 'emerg'], ['Key addresses', 'addr'], ['Trip at a glance', 'glance'], ...DAYS_ALL.map((x): [string, string] => [x.id === 0 ? `Day 0 - Before you leave (${dateTxt(x.date)})` : `Day ${x.id} - ${dateTxt(x.date)}: ${x.title}`, 'day' + x.id]), ['Checklists', 'checklists'], ...(d.budget ? [['Money summary', 'money'] as [string, string]] : []), ['Still to verify', 'verify'], ['Emergency & contacts (full)', 'contacts'], ['Notes', 'notes']];
  for (const [t, k] of entries) {
    let line = ascii(t); const pgn = pg(k); if (W.reg.widthOfTextAtSize(line, 9.5) > W.w - 30) { let k = line.length; while (k > 8 && W.reg.widthOfTextAtSize(line.slice(0, k) + '...', 9.5) > W.w - 30) k--; line = line.slice(0, k).trimEnd() + '...'; } const dots = W.w - W.reg.widthOfTextAtSize(line, 9.5) - W.reg.widthOfTextAtSize(pgn, 9.5) - 6;
    W.need(15);
    W.page.drawText(line, { x: W.x0, y: W.y - 10, size: 9.5, font: W.reg });
    if (dots > 6) W.page.drawText('.'.repeat(Math.floor(dots / W.reg.widthOfTextAtSize('.', 9.5))), { x: W.x0 + W.reg.widthOfTextAtSize(line, 9.5) + 3, y: W.y - 10, size: 9.5, font: W.reg, color: rgb(0.6, 0.6, 0.6) });
    W.page.drawText(pgn, { x: W.x1 - W.reg.widthOfTextAtSize(pgn, 9.5), y: W.y - 10, size: 9.5, font: W.bold });
    W.y -= 15;
  }

  // ---- emergency quick reference (front of the booklet) ----
  W.newPage(); W.mark('emerg'); W.h1('Emergency quick reference');
  W.text('Hong Kong police / fire / ambulance: 999', { size: 14, font: W.bold, gap: 6 });
  W.text('Show this to a taxi driver or a police officer:', { size: 8.5, font: W.bold });
  W.text(`${d.hotel.name}\n${d.hotel.address}\nPhone: ${d.hotel.phone}`, { size: 10, indent: 8, gap: 6 });
  W.h2('If something goes wrong');
  ['Lost or confused: stay put, open this page, ask staff or a police officer to call the hotel.', 'Aya unwell: nearest hospital or call 999. Keep her insurance details and her passport together.', 'Missed connection: go to the airline desk and document the delay. Never assume free rebooking on separate tickets.', 'Phone dead: this booklet has every address and step. Keep a charged power bank in the day bag.'].forEach((t) => W.text('- ' + t, { size: 8.5, indent: 4 }));
  W.y -= 4; W.h2('Insurance / airline numbers (write them here)'); W.lines(5);

  // ---- key addresses ----
  W.newPage(); W.mark('addr'); W.h1('Key addresses');
  W.text('Only places named in your plan. Show a driver the line you need.', { size: 8, gap: 4, color: [0.3, 0.3, 0.3] });
  for (const k of d.keyAddresses ?? []) {
    W.need(40); W.text(k.name, { size: 9, font: W.bold });
    W.text(k.addr, { size: 8, indent: 8 }); if (k.note) W.text(k.note, { size: 7.3, indent: 8, color: [0.45, 0.3, 0] });
    if (k.zh) await W.zh(k.zh, d.zhPng, 11);
    W.y -= 3;
  }

  // ---- trip at a glance ----
  W.newPage(); W.mark('glance'); W.h1('Trip at a glance');
  W.h2('Flights (check against your actual confirmations)');
  for (const f of d.flights) { W.text(`${dateTxt(f.date)}  ${f.code}  ${f.fromCode} -> ${f.toCode}  ${fmt12(f.dep)} -> ${fmt12(f.arr)}  [${f.status === 'confirmed' ? 'CONFIRMED BY USER' : 'VERIFY OFFICIAL SOURCE'}]`, { size: 8.5, font: W.bold }); W.text(`${f.from} to ${f.to}${f.notes ? ' - ' + f.notes : ''}`, { size: 7.5, indent: 10, gap: 2 }); }
  W.h2('Hotel');
  W.text(`${d.hotel.name} - ${d.hotel.room}, ${d.hotel.guests}, ${d.hotel.nights} nights`, { size: 8.5 }); W.text(`${d.hotel.address}\nCheck-in: ${d.hotel.checkIn}\nCheck-out: ${d.hotel.checkOut}\nPhone: ${d.hotel.phone}`, { size: 8, indent: 8 });
  W.text(`Chinese address: ${d.hotel.addressZh ? '(see app)' : 'not verified yet - ask the hotel'}.`, { size: 8, indent: 8, gap: 3 });
  W.h2('Tickets');
  for (const t of d.tickets) W.text(`${dateTxt(t.date)}  ${t.name} - ${t.statusLabel ?? (t.status === 'confirmed' ? 'booked' : t.status)}`, { size: 8 });
  W.h2('Day by day');
  for (const day of DAYS_ALL) W.text(`${day.id === 0 ? 'Day 0 (before)' : 'Day ' + day.id} - ${dateTxt(day.date)}: ${day.title}  (p. ${pg('day' + day.id)})`, { size: 8 });

  // ---- days ----
  for (const day of DAYS_ALL) {
    W.newPage(); W.mark('day' + day.id);
    W.banner(day.id === 0 ? 'DAY 0 - BEFORE YOU LEAVE' : `DAY ${day.id} - ${dateTxt(day.date).toUpperCase()}`, day.title);
    W.text(ARROW(day.route), { size: 8.3, font: W.bold, gap: 1, color: [0.07, 0.16, 0.3] }); W.text(day.subtitle, { size: 7.8, color: [0.3, 0.3, 0.3], gap: 4 });
    const list = d.acts.filter((a) => a.day === day.id).sort((a, b) => a.start.localeCompare(b.start));
    // timeline overview
    W.h2('Timeline overview');
    for (const a of list) W.text(`${fmt12(a.start).padStart(8, ' ')}  ${a.title}`, { size: 7.4, indent: 0, color: a.priority === 'optional' || a.status === 'optional' ? [0.45, 0.45, 0.45] : [0, 0, 0] });
    W.y -= 4; W.rule();
    for (const a of list) {
      const head = `${fmt12(a.start)}${a.end ? ' - ' + fmt12(a.end) : ''}${dur(a.start, a.end)}  ${a.title}`;
      W.need(60);
      W.text(`${a.priority === 'must' ? '* ' : a.priority === 'optional' ? '(optional) ' : ''}${head}`, { size: 8.8, font: W.bold });
      W.text(TAG(a.status) + (a.sub ? '  ' + a.sub : ''), { size: 7.3, indent: 12, color: [0.35, 0.25, 0] });
      const kv: [string, string | undefined][] = [['Where', a.address || a.place], ['Window', a.flex], ['Route', a.route], ['Travel time', a.travel], ['Walk', a.walk], ['Booking', a.booking], ['Cost', a.cost]];
      for (const [k, v] of kv) if (v) W.text(`${k}: ${v}`, { size: 7.4, indent: 12, color: [0.15, 0.15, 0.15] });
      if (a.desc) W.text(a.desc, { size: 7.4, indent: 12, color: [0.25, 0.25, 0.25] });
      if (a.carSeat || modeOf(a)) W.text(CAR, { size: 7.4, indent: 12, font: W.bold, color: [0.55, 0.1, 0.05] });
      if (a.steps?.length) { W.text('Offline directions:', { size: 7.6, indent: 12, font: W.bold }); a.steps.forEach((t, i) => W.text(`${i + 1}. ${t}`, { size: 7.4, indent: 20 })); }
      if (a.zh && d.zhPng) { W.text('Show this name if you are lost:', { size: 7, indent: 12, color: [0.4, 0.4, 0.4] }); await W.zh(a.zh, d.zhPng, 10); }
      for (const alt of a.alts ?? []) {
        const chosen = d.routeChoice?.[a.id] === alt.id;
        W.text(`ALTERNATIVE${chosen ? ' (YOU SELECTED THIS ONE)' : ''}: ${alt.label}  ${TAG(alt.status)}`, { size: 7.6, indent: 12, font: W.bold, color: [0.1, 0.25, 0.5] });
        alt.steps.forEach((t, i) => W.text(`${i + 1}. ${t}`, { size: 7.3, indent: 20 }));
        if (alt.cost) W.text(`Cost: ${alt.cost}`, { size: 7.3, indent: 20 });
      }
      if (a.fallback) W.text(`IF DELAYED: ${a.fallback}`, { size: 7.4, indent: 12, font: W.bold, color: [0.45, 0.3, 0] });
      for (const [k, v] of [['Stroller', a.stroller], ['Restroom', a.restroom], ['Note', a.notes], ['Skip / shorten', a.skip], ['Alternative', a.alt]] as [string, string | undefined][]) if (v) W.text(`${k}: ${v}`, { size: 7.4, indent: 12, color: [0.22, 0.22, 0.22] });
      W.y -= 5;
    }
    const bag = d.dayItems.filter((i) => i.day === day.id && !i.notNeeded);
    if (bag.length) { W.h2(`Day ${day.id} bag - tick when packed`); W.checkCols(bag.map((i) => i.label)); }
  }

  // ---- checklists ----
  const lists: [string, string][] = [['leave', 'Leaving home (Dec 7, ~12:30 AM)'], ['night', 'Night before (every night)'], ['morning', 'Leaving the hotel each morning'], ['checkout', 'Hotel checkout (Dec 11)'], ['home', 'Home again']];
  W.newPage(); W.mark('checklists'); W.h1('Checklists');
  for (const [k, title] of lists) {
    const items = d.finals.filter((f) => f.list === k && !f.notNeeded); if (!items.length) continue;
    W.h2(title);
    const secs = [...new Set(items.map((i) => i.section))];
    for (const sec of secs) { W.text(sec, { size: 7.5, font: W.bold, color: [0.3, 0.3, 0.3] }); W.checkCols(items.filter((i) => i.section === sec).map((i) => i.label), 7.8); }
  }

  // ---- budget ----
  if (d.budget) { W.newPage(); W.mark('money'); W.h1('Money summary'); W.text('Paid = already paid. Quoted = a price you saw, not booked or paid. To verify items are NOT counted. Only the routes you selected count in planned. All from the app at the time of printing; check the app for the live numbers.', { size: 8, gap: 5, color: [0.3, 0.3, 0.3] }); for (const r of d.budget) W.text(`${r.label}: ${r.value}`, { size: 9 }); }

  // ---- verify ----
  W.newPage(); W.mark('verify'); W.h1('Still to verify');
  W.text('Tick only after you have checked the official page or your own booking. Nothing here is checked for you.', { size: 8, gap: 4, color: [0.3, 0.3, 0.3] });
  for (const g of d.gates) { W.check(g.title + (g.userAction ? '  [YOUR ACTION]' : ''), 8.5); W.text(g.detail, { size: 7.3, indent: 13, color: [0.25, 0.25, 0.25] }); for (const l of g.links) W.text(`${l.label}: ${l.url}`, { size: 6.8, indent: 13, color: [0.1, 0.3, 0.6] }); W.y -= 2; }

  // ---- emergency (full) ----
  W.newPage(); W.mark('contacts'); W.h1('Emergency & contacts');
  W.text('Hong Kong police / fire / ambulance: 999', { size: 13, font: W.bold, gap: 6 });
  W.text(`Hotel: ${d.hotel.name}, ${d.hotel.address} - ${d.hotel.phone}`, { size: 9, gap: 4 });
  for (const e of d.emergency) if (e.phone || e.note) W.text(`${e.label}: ${e.phone ?? ''} ${e.note ?? ''}`, { size: 8.5 });
  W.y -= 6; W.h2('Write your private numbers here'); W.lines(8);

  // ---- notes pages: pad to a multiple of 4 (needed for folding) ----
  W.newPage(); W.mark('notes'); W.h1('Notes'); W.lines(30);
  while (W.n % 4 !== 0) { W.newPage(); W.h1('Notes'); W.lines(30); }
  return { bytes: await W.doc.save(), marks: W.marks };
}

/** Two passes: the first finds which page each section lands on, the second prints those numbers in the Index. */
export async function buildBookletPages(d: BookletInput): Promise<Uint8Array> {
  const first = await buildOnce(d, {});
  const second = await buildOnce(d, first.marks);
  return second.bytes;
}

/** Booklet imposition for N pages (N a multiple of 4). Each entry is one printed SIDE: [left page, right page] (1-based). */
export function imposeOrder(n: number): { sheet: number; side: 'front' | 'back'; left: number; right: number }[] {
  const out: { sheet: number; side: 'front' | 'back'; left: number; right: number }[] = [];
  for (let s = 0; s < n / 4; s++) {
    out.push({ sheet: s + 1, side: 'front', left: n - 2 * s, right: 2 * s + 1 });
    out.push({ sheet: s + 1, side: 'back', left: 2 * s + 2, right: n - 2 * s - 1 });
  }
  return out;
}

export async function imposeBooklet(content: Uint8Array): Promise<Uint8Array> {
  const src = await PDFDocument.load(content); const n = src.getPageCount();
  if (n % 4 !== 0) throw new Error('Page count must be a multiple of 4');
  const out = await PDFDocument.create(); const font = await out.embedFont(StandardFonts.Helvetica);
  const emb = await out.embedPdf(src, [...Array(n).keys()]);
  for (const side of imposeOrder(n)) {
    const pg = out.addPage([LW, PH]);
    pg.drawPage(emb[side.left - 1], { x: 0, y: 0 }); pg.drawPage(emb[side.right - 1], { x: PW, y: 0 });
    // fold guide ticks (outside the text area) + a tiny sheet label
    for (const yy of [0, PH - 7]) pg.drawLine({ start: { x: PW, y: yy }, end: { x: PW, y: yy + 7 }, thickness: 0.5, color: rgb(0.55, 0.55, 0.55) });
    pg.drawText(`Sheet ${side.sheet} ${side.side === 'front' ? 'FRONT' : 'BACK'} - pages ${side.left} | ${side.right}`, { x: 8, y: 6, size: 5.5, font, color: rgb(0.6, 0.6, 0.6) });
  }
  return out.save();
}
