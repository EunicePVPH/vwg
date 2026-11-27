import { LINKS } from './links';

export interface Gate { id: string; title: string; detail: string; userAction: boolean; links: { label: string; url: string }[] }
/** Open verification gates from the Nov 27 update. Nothing is marked complete until YOU tick it. */
export const GATES: Gate[] = [
  { id: 'g1', title: 'Peak Tram Sky Terrace — voucher terms for Dec 8', userAction: true, links: [{ label: 'Sky Terrace page', url: LINKS.peakSky }, { label: 'Ticket terms', url: LINKS.peakTerms }],
    detail: 'The general Peak page shows Sky Terrace at 8:30 AM daily; an official ticket-terms page shows 10 AM weekdays for one combo. Open your actual Klook ticket and check entry eligibility, time and validity.' },
  { id: 'g2', title: 'Ocean Park — exact Dec 8 schedule', userAction: false, links: [{ label: 'Hours & notices', url: LINKS.oceanInfo }, { label: 'Attractions', url: LINKS.oceanAttr }],
    detail: 'Panda last admission, cable car, Ocean Express, Grand Aquarium, South Pole Spectacular, crowd restrictions or closures. North Pole Encounter is closed through 2026.' },
  { id: 'g3', title: 'Disneyland Dec 9/10 — reservation, ticket, hours, showtimes', userAction: true, links: [{ label: 'Park reservation', url: LINKS.disneyReserve }, { label: 'Day calendar', url: LINKS.disneyCalendar }, { label: 'Christmas 2026', url: LINKS.disneyXmas }],
    detail: 'First park-visit reservation for each admission, ticket type and date restrictions, operating hours, parade / Momentous / Christmas showtimes, Pixar Magic Passport and medallion details. Do not use a showtime from a different date.' },
  { id: 'g4', title: 'Flights and baggage — from your actual confirmations', userAction: true, links: [{ label: 'Cebu Pacific HKG guide', url: LINKS.cebuHkg }],
    detail: 'Read times, terminals and baggage from the real Cebu Pacific and domestic-carrier confirmations. Dec 11 HKIA check-in is Terminal 2, Aisle R (per Cebu Pacific as of June 9, 2026) — monitor airline notices.' },
  { id: 'g5', title: 'Uber quotes — all are quotes only', userAction: true, links: [{ label: 'Uber', url: LINKS.uber }],
    detail: 'Check future-date availability, real pickup points, a child seat suitable for Aya, the waiting policy, luggage space and traffic. Dec 7 reserve vs on-demand; Dec 10 price was a current on-demand screenshot.' },
  { id: 'g6', title: 'Hotel — actual tax, deposit and paid amount', userAction: true, links: [],
    detail: 'Confirm the property tax and deposit policy, the amount actually paid, and that the Rambler booking is unchanged. Do not substitute any alternative hotel rates.' },
  { id: 'g7', title: 'PhotoPass · PAL baggage · Aya’s travel tax · stroller rental', userAction: true, links: [{ label: 'Disney (official)', url: LINKS.disney }, { label: 'PAL', url: LINKS.pal }],
    detail: 'Is PhotoPass purchased or only planned? Is the PAL baggage purchased? What is Aya’s travel tax status? The stroller rental deposit may be unnecessary because you own a compact stroller.' },
  { id: 'g8', title: 'Night market end time · last ferry · MTR / minibus cut-offs', userAction: false, links: [{ label: 'Star Ferry', url: LINKS.starferry }, { label: 'MTR', url: LINKS.mtr }],
    detail: 'Check these for the days you rely on them. No walking directions are treated as exact unless verified.' },
  { id: 'g9', title: 'Philippine eTravel (free)', userAction: true, links: [{ label: 'eTravel', url: LINKS.etravel }, { label: 'FAQ', url: LINKS.etravelFaq }],
    detail: 'Declarations within 72 hours before Philippine departure AND before Philippine arrival; completed individually or through permitted dependent flows. Aya’s passport profile was deferred until pickup — mark it “verify completed” when done.' },
  { id: 'g10', title: 'Dec 8 walking & station details — exits, lifts, distances', userAction: true, links: [{ label: 'MTR journey planner', url: LINKS.mtr }, { label: 'Star Ferry', url: LINKS.starferry }],
    detail: 'The supplement gives Ocean Park Exit B, Central Exit K, Statue Square, Pier 7, Avenue of Stars walking times and Hong Kong 1 only as planning estimates. Check each exit, lift, walking time, ferry timetable and projection / Wheel hours on the day. No distance in this app is measured.' },
  { id: 'g11', title: 'Dec 9 — minibus 88F, Exit P2, Science Museum Wednesday admission', userAction: true, links: [{ label: 'Science Museum hours', url: LINKS.scienceHours }, { label: 'Admission', url: LINKS.scienceTickets }, { label: 'MTR', url: LINKS.mtr }],
    detail: 'Minibus 88F stop near Rambler Crest Tower 3, fare (~HK$4.30 once seen), first service and stroller rules; East Tsim Sha Tsui Exit P2 and its lifts; museum opening time, free Wednesday permanent galleries and any paid special exhibition.' },
  { id: 'g12', title: 'Dec 9 evening — Disney → Temple Street route, market hours', userAction: true, links: [{ label: 'MTR', url: LINKS.mtr }, { label: 'Disney calendar', url: LINKS.disneyCalendar }],
    detail: 'Choose MTR or Uber with an actual quote; confirm Jordan Station exit and lift, Temple Street market hours and the legal car pickup near Jordan Road. Check the last train and last minibus before relying on them.' },
  { id: 'g13', title: 'Pixar Magic Passport · medallion · Disney meal vouchers · PhotoPass', userAction: true, links: [{ label: 'Disney (official)', url: LINKS.disney }, { label: 'Day calendar', url: LINKS.disneyCalendar }],
    detail: 'Pixar passport price (~HK$149 discussed), redemption venue and whether the medallion is still available; meal voucher (~₱2,478) and child meal (~₱967) were only discussed — not bought; PhotoPass HK$398 status; First Visit pins.' },
  { id: 'g14', title: 'Airport procedures — Dec 7 (Manila, Hong Kong) and Dec 11 (HKIA T2 → T1, Manila connection)', userAction: true, links: [{ label: 'Cebu Pacific HKG guide', url: LINKS.cebuHkg }, { label: 'eTravel', url: LINKS.etravel }],
    detail: 'Terminals, check-in desks, baggage rules, T2 → T1 connection, stroller handling, and the Manila domestic leg are read from your real tickets and airline notices. The app does not invent gates, platforms, flight times or minimum connection times.' },
];

export type RemindKind = 'deadline';
export interface Deadline { id: string; at: string; title: string; body: string; link?: string }
/** Suggested date reminders from your update (times are my defaults — HK/PH time, both UTC+8). */
export const DEADLINES: Deadline[] = [
  { id: 'dl-dec4', at: '2026-12-04T09:00:00+08:00', title: 'Dec 4 · outbound eTravel', body: 'Complete the outbound eTravel (within 72 h of your actual Dec 7 departure), check all three QR codes, flight confirmation and travel documents.', link: 'https://etravel.gov.ph' },
  { id: 'dl-dec6', at: '2026-12-06T09:00:00+08:00', title: 'Dec 6 · final flight & ride check', body: 'Final flight/check-in check, baggage allowance or pre-purchase if eligible, confirm the airport ride, save documents offline.' },
  { id: 'dl-dec8', at: '2026-12-08T20:00:00+08:00', title: 'Dec 8 · prepare for Dec 9', body: 'Prepare for the Dec 9 museum → Disney transfer and pack the day bag.' },
  { id: 'dl-dec9', at: '2026-12-09T20:00:00+08:00', title: 'Dec 9 · confirm Disneyland for tomorrow', body: 'Confirm tomorrow’s Disneyland hours, showtimes and any ticket reservation, and the return transport plan.', link: 'https://www.hongkongdisneyland.com/en-hk/calendars/day/' },
  { id: 'dl-dec10', at: '2026-12-10T09:00:00+08:00', title: 'Dec 10 · pack, weigh & inbound eTravel', body: 'Pack and weigh return baggage; complete inbound eTravel (within 72 h of Philippine arrival); reconfirm online check-in and any extra baggage options; verify the early airport departure.', link: 'https://etravel.gov.ph' },
  { id: 'dl-dec11', at: '2026-12-11T05:45:00+08:00', title: 'Dec 11 · leave checklist', body: 'Passports, phones, chargers, stroller, baggage, hotel deposit release, return flight.' },
];
