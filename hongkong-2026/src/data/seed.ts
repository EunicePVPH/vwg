// All trip content lives here, separate from the UI. Anything you can change in the
// app is stored as an edit on top of this file, so you never need to rebuild to
// update times, costs or booking details.
import type { Funding, ShoppingItem, Activity, Day, EmergencyItem, Expense, Flight, HealthItem, Hotel, PackItem, Restaurant, Task, Ticket } from '../types';

export const SEED_VERSION = 1;

export const FAMILY = [
  { name: 'Keren', role: 'Mom', color: 'pink' },
  { name: 'Gilbert', role: 'Dad', color: 'sky' },
  { name: 'Aya', role: 'Our 2-year-old', color: 'sun' },
] as const;

import { LINKS } from './links';
export { LINKS };

export const DAYS: Day[] = [
  { id: 1, date: '2026-12-07', weekday: 'Monday', title: 'Arrival Day', subtitle: 'Goa → Daraga → Manila → Hong Kong → Rambler Oasis',
    route: ['Goa', 'Daraga', 'Manila', 'Hong Kong', 'Hotel'], routeModes: ['car', 'plane', 'plane', 'uber'], photoKey: 'airport', accent: 'sky', summaryNote: '' },
  { id: 2, date: '2026-12-08', weekday: 'Tuesday', title: 'Peak, Ocean Park, Central & the Harbour', subtitle: 'Uber → Peak Tram → MTR → Ocean Park → MTR → Central → Star Ferry → Uber',
    route: ['Hotel', 'The Peak', 'Ocean Park', 'Central', 'TST', 'Hotel'], routeModes: ['uber', 'mtr', 'mtr', 'ferry', 'uber'], photoKey: 'peak', accent: 'coral', summaryNote: '' },
  { id: 3, date: '2026-12-09', weekday: 'Wednesday', title: 'Science Museum, Disney Day 1 & Temple Street', subtitle: 'Minibus + MTR → Science Museum → Uber → Disneyland → Temple Street → Uber',
    route: ['Hotel', 'Tsing Yi', 'Science Museum', 'Disneyland', 'Temple St', 'Hotel'], routeModes: ['bus', 'mtr', 'uber', 'mtr', 'uber'], photoKey: 'science', accent: 'turq', summaryNote: '' },
  { id: 4, date: '2026-12-10', weekday: 'Thursday', title: 'Disneyland Full Day', subtitle: 'Uber → Disneyland (PhotoPass, gentle rides, Momentous) → Uber home',
    route: ['Hotel', 'Disneyland', 'Hotel'], routeModes: ['uber', 'uber'], photoKey: 'disney', accent: 'lav', summaryNote: '' },
  { id: 5, date: '2026-12-11', weekday: 'Friday', title: 'Return Home', subtitle: 'Uber → HKIA T2 check-in → T1 boarding → Manila → Daraga → Goa',
    route: ['Hotel', 'HK Airport', 'Manila', 'Daraga', 'Goa'], routeModes: ['uber', 'plane', 'plane', 'car'], photoKey: 'harbour', accent: 'sun', summaryNote: '' },
];

/** Day 0 = everything to do before leaving (on or before Dec 6). Kept separate so Home / Money / Packing keep their five trip days. */
export const DAY0: Day = { id: 0, date: '2026-12-06', weekday: 'Sunday', title: 'Before You Leave', subtitle: 'Documents · eTravel · baggage · packing — on or before Dec 6',
  route: ['Documents', 'eTravel', 'Baggage', 'Packing'], routeModes: ['walk', 'walk', 'walk'], photoKey: 'airport', accent: 'sky', summaryNote: '' };
export const ALL_DAYS: Day[] = [DAY0, ...DAYS];

export { ACTIVITIES } from './itinerary';

export const TICKETS: Ticket[] = [
  { id: 't-peak', name: 'Peak Tram + Sky Terrace 428', photoKey: 'peak', dayId: 2, date: '2026-12-08', type: 'Peak Tram + Sky Terrace combo', status: 'confirmed', statusLabel: 'Purchased — voucher terms to verify',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (under-3 policy: verify)' }],
    notes: 'Purchased (₱2,502 recorded). ⚠ Sky Terrace OPENING CONFLICT: the general Peak page says 8:30 AM daily; an official ticket-terms page says 10 AM weekdays for one combo. Check the terms on YOUR actual voucher before deciding the morning order.', place: 'Peak Tram Lower Terminus, 33 Garden Road, Central',
    restrictions: ['Voucher terms govern entry time and validity.'], bookingUrl: LINKS.peakTerms, bookingLabel: 'Ticket terms (official)' },
  { id: 't-oceanpark', name: 'Ocean Park Hong Kong', photoKey: 'oceanpark', dayId: 2, date: '2026-12-08', type: 'General admission', status: 'confirmed',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (under 3 — free entry)' }],
    notes: 'Two adult “Daytime Ticket” admissions (Klook voucher dated Dec 8; each ticket also prints a validity window of Dec 2, 2026 – Jan 2, 2027). Aya (under 3) enters free. Present the QR on your phone or on A4 paper; you may be asked for photo ID and the credit card used to buy. Non-refundable. Not valid on park rest days. FasTrack is optional and not purchased. The Klook redemption instructions are saved with the tickets.', place: 'Ocean Park Hong Kong',
    restrictions: ['Non-refundable and not exchangeable. Entry can be limited at maximum capacity; rides may close for weather or repairs without refund.', 'Do not damage or wet the QR code — it must be scanned at the entrance.'], bookingUrl: LINKS.oceanpark, bookingLabel: 'Open Ocean Park site' },
  { id: 't-wheel', name: 'Hong Kong Observation Wheel', photoKey: 'wheel', dayId: 2, date: '2026-12-08', type: 'Klook voucher · 2 adult tickets', status: 'confirmed',
    guests: [{ label: 'Keren (adult) — original Klook QR' }, { label: 'Gilbert (adult) — original Klook QR' }, { label: 'Aya (under 3 — free)' }],
    notes: 'ONE Klook PDF holds BOTH adult QR codes (Keren and Gilbert see the same original file). Valid ONLY on Dec 8, 2026; no time slot is printed (latecomers are subject to capacity). Aya (age 0–2) rides free with a paying adult — no ticket. The stroller cannot go into the gondola — use stroller storage and check the posted fee on site.', place: '33 Man Kwong Street, Central',
    restrictions: ['No stroller in the gondola.', 'No cancellation or refund. No food or drinks inside the Wheel or boarding deck.', 'Each gondola is shared with other visitors (up to 8 people).'], bookingUrl: LINKS.klook, bookingLabel: 'Open Klook' },
  { id: 't-science', name: 'Hong Kong Science Museum', photoKey: 'science', dayId: 3, date: '2026-12-09', type: 'No ticket recorded — permanent exhibitions free on Wednesdays (verify)', status: 'verify',
    guests: [{ label: 'Keren' }, { label: 'Gilbert' }, { label: 'Aya' }], notes: 'Opens 10 AM on Wednesdays; permanent exhibitions are free on Wednesdays, special exhibitions may charge. Verify on the official pages.', place: 'Hong Kong Science Museum, Tsim Sha Tsui East',
    bookingUrl: LINKS.scienceTickets, bookingLabel: 'Admission info (official)' },
  { id: 't-disney', name: 'Hong Kong Disneyland', photoKey: 'disney', dayId: 4, date: '2026-12-10', type: '2-day park ticket (Dec 9 & 10)', status: 'confirmed', statusLabel: 'Purchased — park reservation to verify',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (age policy: verify)' }],
    notes: '2-day tickets purchased (₱12,473.73 recorded). Verify the official park-visit reservation steps for each admission and any date restrictions on the ticket.', place: 'Hong Kong Disneyland',
    bookingUrl: LINKS.disneyReserve, bookingLabel: 'Park reservation (official)' },
  { id: 't-photopass', name: 'Disney PhotoPass', photoKey: 'disney', dayId: 4, date: '2026-12-10', type: 'Official PhotoPass service (no outside photographer)', status: 'pending', statusLabel: 'Not yet purchased',
    guests: [{ label: 'Keren, Gilbert & Aya — family photos' }],
    notes: 'We use official Disneyland PhotoPass photographers only. Package prices and options must be verified on the official site. Review and download all photos after the visit.',
    restrictions: ['Locations, availability and times: verify from official Disney information.'], place: 'Hong Kong Disneyland', bookingUrl: LINKS.disney, bookingLabel: 'Official Disney site' },
];

export const FLIGHTS: Flight[] = [
  { id: 'f1', airline: 'Philippine Airlines (PAL Express)', code: 'PR2922', from: 'Daraga', fromCode: 'DRP', to: 'Manila', toCode: 'MNL', date: '2026-12-07', dep: '06:45', arr: '07:45', arrTerminal: 'NAIA Terminal 2',
    seats: [{ who: 'Keren', seat: '37H' }, { who: 'Aya', seat: '37J' }, { who: 'Gilbert', seat: '37K' }], baggage: 'PAL e-tickets: NO checked baggage included for all three passengers. Any checked bag must be bought separately (PENDING — not recorded as bought).', carryOn: 'Confirm PAL carry-on rules on your ticket.', status: 'confirmed', bookingUrl: LINKS.pal },
  { id: 'f2', airline: 'Cebu Pacific', code: '5J112', from: 'Manila', fromCode: 'MNL', to: 'Hong Kong', toCode: 'HKG', date: '2026-12-07', dep: '15:15', arr: '18:00', depTerminal: 'NAIA Terminal 3', arrTerminal: 'Hong Kong Terminal 1 (per ticket)',
    seats: [{ who: 'Gilbert', seat: '21A' }, { who: 'Aya', seat: '21B' }, { who: 'Keren', seat: '21C' }], baggage: 'Cebu Pacific confirmation: Gilbert 1 × 20 kg checked bag. Keren and Aya (GO Basic): no checked bag included.', carryOn: 'Carry-on and personal item: confirm from your active ticket and Cebu Pacific rules.', status: 'confirmed',
    notes: '7 h 30 min between the two scheduled flights on Dec 7. Separate airlines — bags are not checked through.', bookingUrl: LINKS.cebu },
  { id: 'f3', airline: 'Cebu Pacific', code: '5J111', from: 'Hong Kong', fromCode: 'HKG', to: 'Manila', toCode: 'MNL', date: '2026-12-11', dep: '11:00', arr: '13:30', arrTerminal: 'NAIA Terminal 3',
    depTerminal: 'Hong Kong Terminal 2 (per confirmation)', seats: [], baggage: 'Cebu Pacific confirmation: Gilbert 1 × 20 kg checked bag. Keren and Aya (GO Basic): no checked bag included.', carryOn: 'Carry-on and personal item: confirm from your active ticket and Cebu Pacific rules.', status: 'confirmed',
    notes: 'Return seats currently unassigned. Check-in: verify Cebu Pacific\'s current Terminal 2 check-in instructions and the link to the Terminal 1 boarding area. Check-in and boarding are in different places.', bookingUrl: LINKS.cebu },
  { id: 'f4', airline: 'Philippine Airlines (PAL Express)', code: 'PR2925', from: 'Manila', fromCode: 'MNL', to: 'Daraga', toCode: 'DRP', date: '2026-12-11', dep: '17:35', arr: '18:45', depTerminal: 'NAIA Terminal 2',
    seats: [{ who: 'Keren', seat: '38J' }, { who: 'Gilbert', seat: '38K' }, { who: 'Aya', seat: '38H' }], baggage: 'PAL e-tickets: NO checked baggage included for all three passengers. Any checked bag must be bought separately (PENDING — not recorded as bought).', carryOn: 'Confirm PAL carry-on rules on your ticket.', status: 'confirmed',
    notes: 'TIME-SENSITIVE: 4 h 5 min after Cebu Pacific lands. Separate booking: immigration, baggage, stroller rental return and the T3 → T2 transfer all happen in between.', bookingUrl: LINKS.pal },
];

export const HOTEL: Hotel = {
  id: 'hotel', name: 'Rambler Oasis Hotel', address: '1 Tsing Yi Road, Tsing Yi, Hong Kong', addressZh: '',
  phone: '+852 2129 1188', checkIn: 'Monday, Dec 7 · from 2:00 PM', checkOut: 'Friday, Dec 11 · by 12:00 noon', room: 'Standard Twin Room', guests: '2 adults + 1 child', nights: 4, bookedVia: 'Expedia',
  totalUSD: 271.65, paidUSD: 264.44, localTaxHKD: 56.6, depositHKD: 500, depositStatus: 'unknown', paymentMethod: '',
  upgradeNote: 'We decided NOT to upgrade to the Business Room.',
  shuttleNote: 'Hotel shuttle schedule is NOT confirmed. Ask the hotel before relying on it.',
  notes: 'Chinese address not yet verified — tap Edit and paste it once the hotel confirms it.',
};

export const EXPENSES: Expense[] = [
  // ── Paid before the trip (user-recorded, Nov 27 handwritten notes; PHP unless marked) ──
  { id: 'e-5j', label: 'Airfare MNL–HKG–MNL (Cebu Pacific)', category: 'Flights', amount: 42087.93, currency: 'PHP', status: 'paid', kind: 'spend', note: 'User-recorded amount kept. The Cebu Pacific payment page shows PHP 40,815.93 (fare 36,743.93 + add-ons 4,072.00 incl. seats 1,272.00); the ₱1,272.00 difference matches the seat charge — check your card statement.' },
  { id: 'e-pal', label: 'Airfare DRP–MNL–DRP (PAL)', category: 'Flights', amount: 14784, currency: 'PHP', status: 'paid', kind: 'spend', note: 'User-recorded' },
  { id: 'e-hotel', label: 'Hotel Rambler Oasis', category: 'Hotel', amount: 16828.46, currency: 'PHP', status: 'paid', kind: 'spend', note: 'Actual amount paid for the Expedia booking' },
  { id: 'e-disney', label: 'Disney 2-day tickets', category: 'Activities & Attractions', amount: 12473.73, currency: 'PHP', status: 'paid', kind: 'spend', day: 3, note: 'User-recorded · Dec 9 & 10' },
  { id: 'e-ocean', label: 'Ocean Park', category: 'Activities & Attractions', amount: 7195.1, currency: 'PHP', status: 'paid', kind: 'spend', day: 2, note: 'User-recorded' },
  { id: 'e-peak', label: 'Peak Tram', category: 'Activities & Attractions', amount: 2502, currency: 'PHP', status: 'paid', kind: 'spend', day: 2, note: 'User-recorded · Sky Terrace voucher terms: verify' },
  { id: 'e-wheel', label: 'Observation Wheel', category: 'Activities & Attractions', amount: 344, currency: 'PHP', status: 'paid', kind: 'spend', day: 2, note: 'User-recorded' },
  { id: 'e-esim', label: 'eSIM', category: 'Essentials', amount: 592, currency: 'PHP', status: 'paid', kind: 'spend', note: 'User-recorded' },
  { id: 'e-octopus', label: 'Octopus Card', category: 'Transport', amount: 1720, currency: 'PHP', status: 'paid', kind: 'spend', note: 'User-recorded' },
  { id: 'e-insurance', label: 'Travel Insurance', category: 'Essentials', amount: 1548, currency: 'PHP', status: 'paid', kind: 'spend', note: 'User-recorded' },
  // ── Travel shopping (user-recorded; handwritten names clarified — review if any look wrong) ──
  { id: 'e-s-01', label: 'Luggage, wheel cover + cover + strap', category: 'Shopping', amount: 2936.1, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-02', label: 'Travel adapter', category: 'Shopping', amount: 216, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-03', label: 'Travel organizer', category: 'Shopping', amount: 658, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-04', label: 'Tabo + balde', category: 'Shopping', amount: 259, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-05', label: 'Extension cord', category: 'Shopping', amount: 436, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-06', label: 'Portable baby bottle brush', category: 'Shopping', amount: 175, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-07', label: 'Vomit bags', category: 'Shopping', amount: 324, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-08', label: 'Portable digital luggage scale', category: 'Shopping', amount: 124, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-09', label: 'Other travel organizers', category: 'Shopping', amount: 737, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-10', label: 'Thermometer', category: 'Shopping', amount: 147, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-11', label: 'Bags', category: 'Shopping', amount: 720, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-12', label: 'Neck pillow', category: 'Shopping', amount: 238, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-13', label: 'Mickey headbands', category: 'Shopping', amount: 182, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-14', label: 'Raincoats', category: 'Shopping', amount: 247, currency: 'PHP', status: 'paid', kind: 'spend' },
  { id: 'e-s-15', label: 'Tripod', category: 'Shopping', amount: 399, currency: 'PHP', status: 'paid', kind: 'spend', note: 'Recorded as bought. (An earlier packing note said no tripod — review if you plan to use it.)' },
  { id: 'e-s-16', label: 'Vacuum storage bags + sealer', category: 'Shopping', amount: 712.58, currency: 'PHP', status: 'paid', kind: 'spend' },
  // ── Uber QUOTES (not booked, not paid) ──
  { id: 'e-uber-d1', label: 'Uber Car Seat: HKIA → Rambler (Dec 7)', category: 'Transport', amount: 319.18, currency: 'HKD', status: 'quoted', kind: 'spend', day: 1, note: 'Chosen · quote · not booked' },
  { id: 'e-uber-d2a', label: 'Uber Car Seat: Rambler → Peak Tram (Dec 8, 7:30 AM)', category: 'Transport', amount: 263.87, currency: 'HKD', status: 'quoted', kind: 'spend', day: 2, note: 'Chosen · quote · not booked' },
  { id: 'e-uber-d2b', label: 'Uber Car Seat: Tsim Sha Tsui → Rambler (Dec 8, 10:30 PM)', category: 'Transport', amount: 171.36, currency: 'HKD', status: 'quoted', kind: 'spend', day: 2, note: 'Chosen · quote · from Tsim Sha Tsui (confirmed by you)' },
  { id: 'e-mtr-d2', label: 'MTR (2 adults) — Dec 8', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 2, note: 'Amount to verify' },
  { id: 'e-ferry-d2', label: 'Star Ferry (2 adults) — Dec 8', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 2, note: 'Amount to verify' },
  { id: 'e-uber-d3a', label: 'Uber Car Seat: Science Museum → Disneyland (Dec 9)', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 3, note: 'Quote still needed' },
  { id: 'e-uber-d3b', label: 'Uber Car Seat: Temple Street → Rambler (Dec 9)', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 3, note: 'Quote still needed' },
  { id: 'e-uber-d4a', label: 'Uber Car Seat: Rambler → Disneyland (Dec 10) — REFERENCE ONLY', category: 'Transport', amount: 185.3, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 4, note: 'Screenshot of a current 10:23 AM on-demand pickup — NOT a confirmed Dec 10 rate, not counted' },
  { id: 'e-uber-d4b', label: 'Uber Car Seat: Disneyland → Rambler (Dec 10)', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 4, note: 'Quote needed' },
  { id: 'e-uber-d5', label: 'Uber Car Seat: Rambler → HKIA T2 (Dec 11)', category: 'Transport', amount: null, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 5, note: 'Price not obtained' },
  // ── Not yet settled / verify ──
  { id: 'e-palbag', label: 'PAL checked baggage (handwritten ≈)', category: 'Flights', amount: 2200, currency: 'PHP', status: 'to_verify', kind: 'spend', note: 'Booking/payment status to verify; domestic routing airline to confirm' },
  { id: 'e-tax', label: 'Hotel property tax due at property', category: 'Hotel', amount: 56.6, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 1, note: 'Handwritten — confirm actual voucher / currency' },
  { id: 'e-deposit', label: 'Hotel deposit (HK$500 hold)', category: 'Hotel', amount: 500, currency: 'HKD', status: 'refundable_hold', kind: 'deposit', day: 1, note: 'Refundable hold — not trip spending if refunded' },
  { id: 'e-pixar', label: 'Pixar Magic Passport (price discussed ~HK$149 — verify in the park)', category: 'Activities & Attractions', amount: 149, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 3, note: 'Not bought. Counts nowhere until you confirm and change the status.' },
  { id: 'e-dmeal', label: 'Disney meal voucher — adult (Lunch + Dinner + Snack, discussed)', category: 'Food', amount: 2478, currency: 'PHP', status: 'to_verify', kind: 'spend', day: 4, note: 'Discussed only, not confirmed purchased.' },
  { id: 'e-dmeal-c', label: 'Disney meal voucher — child-sized (discussed)', category: 'Food', amount: 967, currency: 'PHP', status: 'to_verify', kind: 'spend', day: 4, note: 'Discussed only. Check the age rules for a 2-year-old before buying.' },
  { id: 'e-photopass', label: 'Disney PhotoPass', category: 'Activities & Attractions', amount: 398, currency: 'HKD', status: 'to_verify', kind: 'spend', day: 4, note: 'Handwritten — confirm purchased vs planned' },
  { id: 'e-traveltax', label: 'Aya’s travel tax', category: 'Flights', amount: null, currency: 'PHP', status: 'to_verify', kind: 'spend', note: 'Amount and payment not confirmed' },
  { id: 'e-stroller', label: 'Stroller rent + refundable deposit (faint ₱2,500)', category: 'Other', amount: 2500, currency: 'PHP', status: 'to_verify', kind: 'spend', note: 'You already own a compact stroller — possibly unnecessary. Not counted.' },
  { id: 'e-cash', label: 'Planned first ATM withdrawal (Wise)', category: 'Cash', amount: 1500, currency: 'HKD', status: 'estimated', kind: 'cash', day: 1, note: 'Cash in hand, not an expense' },
];

/** Trip funding / allocation — NOT an expense and NOT a bank balance. */
export const FUNDING: Funding[] = [
  { id: 'fund-bacilia', label: 'From Bacilia ($1,300)', amount: 80922.51, currency: 'PHP', note: 'User-recorded allocation. Other income, funding and spending may exist.' },
];

/** Uber quotes that were compared but NOT selected (MTR was chosen). History only — never in the budget. */
export const UBER_COMPARISON = [
  { when: 'Dec 8 10:30 AM', leg: 'Peak Tram → Ocean Park (Car Seat)', hkd: 298.24, note: 'Alternative only — MTR chosen' },
  { when: 'Dec 8 5:45 PM', leg: 'Ocean Park → Statue Square (Car Seat)', hkd: 173.38, note: 'Alternative only — MTR chosen' },
  { when: 'Dec 8', leg: 'Original four-Uber plan, total', hkd: 906.85, note: 'Comparison only' },
  { when: 'Dec 7', leg: 'Klook airport transfer quote', php: 3686.4, note: 'Comparison only — NOT selected (Uber chosen)' },
];

export const EXPENSE_CATEGORIES = ['Flights', 'Hotel', 'Food', 'Transport', 'Activities & Attractions', 'Shopping', 'Essentials', 'OOTD', 'Other'];

export const TASKS: Task[] = [
  { id: 'k-peak', title: 'Check the Peak Tram / Sky Terrace voucher terms (8:30 AM vs 10 AM conflict)', group: 'Tickets', status: 'verify', due: '2026-12-06', critical: true, note: 'Tickets are purchased. Open your actual Klook voucher.', link: { label: 'Ticket terms (official)', url: LINKS.peakTerms } },
  { id: 'k-etravel-out', title: 'Complete outbound eTravel (within 72 h of Dec 7 departure) and check all 3 QR codes', group: 'Documents', status: 'pending', due: '2026-12-04', critical: true, link: { label: 'eTravel', url: LINKS.etravel } },
  { id: 'k-etravel-in', title: 'Complete inbound eTravel (within 72 h of Philippine arrival, on/after Dec 8)', group: 'Documents', status: 'pending', due: '2026-12-10', critical: true, link: { label: 'eTravel', url: LINKS.etravel } },
  { id: 'k-uber-quotes', title: 'Get Uber quotes still needed: Dec 9 (museum → Disney, Temple St → hotel), Dec 10 return, Dec 11 airport', group: 'Money', status: 'pending', due: '2026-12-06' },
  { id: 'k-disney-res', title: 'Verify Disneyland park reservation, hours and showtimes for Dec 9 and Dec 10', group: 'Tickets', status: 'verify', due: '2026-12-08', critical: true, link: { label: 'Park reservation', url: LINKS.disneyReserve } },
  { id: 'k-palbag', title: 'Buy PAL checked baggage once the suitcase weight is known', group: 'Flights', status: 'pending', due: '2026-12-05', critical: true, note: 'PAL domestic receipts show no free checked bag.' },
  { id: 'k-import', title: 'Import all original tickets, boarding passes and hotel booking into Phone Documents', group: 'Documents', status: 'pending', due: '2026-12-01', critical: true },
  { id: 'k-backup', title: 'Make an encrypted backup (Settings & Backup)', group: 'Documents', status: 'pending', due: '2026-12-02' },
  { id: 'k-stroller', title: 'Confirm stroller-rental company, number and handover point', group: 'Manila', status: 'pending', due: '2026-12-04', critical: true, note: 'Details pending.' },
  { id: 'k-travel-tax', title: 'Check Aya\'s travel tax (pay at T3 if still unpaid)', group: 'Manila', status: 'pending', due: '2026-12-06' },
  { id: 'k-5jseats', title: 'Return seats for 5J111 are unassigned — check if seats are available', group: 'Flights', status: 'pending', due: '2026-12-08' },
  { id: 'k-hkg-t2', title: 'Verify Cebu Pacific Terminal 2 check-in instructions (Hong Kong)', group: 'Flights', status: 'verify', due: '2026-12-09', critical: true },
  { id: 'k-passports', title: 'Check passport validity and Hong Kong entry rules', group: 'Documents', status: 'verify', due: '2026-11-25', critical: true },
  { id: 'k-aya-docs', title: 'Check Aya\'s documents for travel (birth certificate copy, any airline/immigration needs)', group: 'Documents', status: 'verify', due: '2026-11-25' },
  { id: 'k-esim', title: 'Set up eSIM / roaming and test it', group: 'Phone & money', status: 'pending', due: '2026-12-05' },
  { id: 'k-wise', title: 'Check Wise card ATM fees and daily withdrawal limits', group: 'Phone & money', status: 'pending', due: '2026-12-01' },
  { id: 'k-hotel-zh', title: 'Verify the hotel\'s Chinese address (ask the hotel / confirm on Expedia)', group: 'Hotel', status: 'verify', due: '2026-12-01' },
  { id: 'k-shuttle', title: 'Ask the hotel about a shuttle to Tsing Yi MTR (schedule not confirmed)', group: 'Hotel', status: 'verify', due: '2026-12-01' },
  { id: 'k-disney', title: 'Verify Disneyland tickets, opening hours and Momentous time', group: 'Tickets', status: 'verify', due: '2026-12-05' },
  { id: 'k-photopass', title: 'Check official PhotoPass options and prices (not purchased yet)', group: 'Tickets', status: 'verify', due: '2026-12-05' },
  { id: 'k-fastrack', title: 'Decide on Ocean Park FasTrack on the day (optional)', group: 'Tickets', status: 'optional' },
  { id: 'k-maps', title: 'Download offline Google Maps area for Hong Kong', group: 'Phone & money', status: 'pending', due: '2026-12-05' },
  { id: 'k-weather', title: 'Check the forecast a few days before leaving', group: 'Before you go', status: 'pending', due: '2026-12-04' },
  { id: 'k-insurance', title: 'Import travel insurance documents and save the claims number', group: 'Documents', status: 'pending', due: '2026-12-01' },
];

export const PACKING: PackItem[] = [
  ...['Passports (all 3)', 'Aya\'s birth certificate copy', 'Printed + phone copies of bookings', 'Insurance details', 'Wise card + some cash', 'Hotel confirmation', 'Pen for forms'].map((l, i) => ({ id: `p-doc-${i}`, label: l, group: 'Documents' })),
  ...['Diapers / pull-ups (extra for travel days)', 'Wipes', 'Change of clothes (2–3 for Aya)', 'Snacks + water bottle', 'Comfort toy / blanket', 'Favorite small toys + book', 'Sunhat + sunscreen', 'Light jacket for Aya', 'Spare plastic bags'].map((l, i) => ({ id: `p-aya-${i}`, label: l, group: 'Aya\'s backpack (Gilbert carries)', owner: 'Gilbert' })),
  ...['Pump / nursing supplies if needed', 'Nursing cover', 'Milk storage bags', 'Hand sanitizer'].map((l, i) => ({ id: `p-bf-${i}`, label: l, group: 'Keren\'s feeding items', owner: 'Keren' })),
  ...['Comfortable walking shoes', 'Light layers (cool, dry December)', 'Light rain jacket / umbrella', 'Pajamas', 'Socks', 'Swimwear — only if the hotel has a pool (verify)'].map((l, i) => ({ id: `p-clo-${i}`, label: l, group: 'Clothes' })),
  ...['Phone chargers + power bank', 'UK-style 3-pin (Type G) adapter — Hong Kong uses 220 V', 'Earphones', 'Camera / extra storage'].map((l, i) => ({ id: `p-tech-${i}`, label: l, group: 'Gadgets' })),
  ...['Toothbrushes', 'Aya\'s toiletries', 'Sunscreen', 'Personal medicines', 'Aya\'s medicines (see Health)', 'First-aid basics'].map((l, i) => ({ id: `p-toi-${i}`, label: l, group: 'Health & toiletries' })),
  ...['Rented stroller — collected at NAIA T3', 'Stroller rain cover', 'Light baby carrier (optional)'].map((l, i) => ({ id: `p-str-${i}`, label: l, group: 'Stroller' })),
];

export const RESTAURANTS: Restaurant[] = [
  { id: 'r-hotel', name: 'Restaurants near Rambler Plaza', area: 'Tsing Yi', kind: 'Dinner · Day 1', status: 'verify', query: 'restaurants near Rambler Plaza Tsing Yi', dayId: 1, note: 'Find a quick, quiet dinner on arrival night.' },
  { id: 'r-market', name: 'Supermarket (water, snacks, breakfast)', area: 'Tsing Yi', kind: 'Groceries', status: 'verify', query: 'supermarket near Rambler Oasis Hotel Tsing Yi', dayId: 1 },
  { id: 'r-pharm', name: 'Pharmacy near the hotel', area: 'Tsing Yi', kind: 'Pharmacy', status: 'verify', query: 'pharmacy near Rambler Oasis Hotel Tsing Yi' },
  { id: 'r-club', name: 'Club Panda (Ocean Park)', area: 'Ocean Park', kind: 'Lunch · Day 2', status: 'verify', query: 'Club Panda Ocean Park Hong Kong', dayId: 2, note: 'Verify it is open and suitable on the day.' },
  { id: 'r-central', name: 'Late meal near Central Harbourfront', area: 'Central', kind: 'Late meal · Day 2', status: 'optional', query: 'restaurants near Central Harbourfront', dayId: 2 },
  { id: 'r-tst', name: 'Lunch near Science Museum', area: 'Tsim Sha Tsui East', kind: 'Lunch · Day 3', status: 'verify', query: 'restaurants near Hong Kong Science Museum', dayId: 3 },
  { id: 'r-tstd', name: 'Family dinner in Tsim Sha Tsui', area: 'Tsim Sha Tsui', kind: 'Dinner · Day 3', status: 'verify', query: 'family restaurants Tsim Sha Tsui', dayId: 3 },
  { id: 'r-disney', name: 'Disneyland restaurants (check official map)', area: 'Disneyland', kind: 'Meals · Day 4', status: 'verify', query: 'Hong Kong Disneyland restaurants', dayId: 4 },
  { id: 'r-airport', name: 'Airport breakfast near Cebu Pacific gate', area: 'HK Airport', kind: 'Day 5', status: 'verify', query: 'restaurants Hong Kong International Airport', dayId: 5 },
];

export const HEALTH: HealthItem[] = [
  { id: 'h-1', kind: 'note', label: 'Aya\'s fever / pain medicine', value: 'Add name and the dose your pediatrician gave you.' },
  { id: 'h-2', kind: 'allergy', label: 'Allergies', value: 'Add any allergies for Aya, Keren and Gilbert.' },
  { id: 'h-3', kind: 'contact', label: 'Pediatrician (Philippines)', value: 'Add name and number.' },
  { id: 'h-4', kind: 'note', label: 'Insurance policy', value: 'Policy number and claims hotline: see your Insurance folder in Phone Documents.' },
];

export const EMERGENCY: EmergencyItem[] = [
  { id: 'em-999', label: 'Hong Kong emergency (police, fire, ambulance)', phone: '999', status: 'confirmed', urgent: true },
  { id: 'em-hotel', label: 'Rambler Oasis Hotel', phone: '+852 2129 1188', status: 'confirmed' },
  { id: 'em-consulate', label: 'Philippine Consulate General, Hong Kong', phone: '', note: 'Add the number from the official site before you go.', status: 'verify' },
  { id: 'em-hosp', label: 'Nearest public hospital with A&E', phone: '', note: 'Look up the closest A&E to Tsing Yi and note it here.', status: 'verify' },
  { id: 'em-ins', label: 'Travel insurance 24/7 hotline', phone: '', note: 'Copy from your policy documents.', status: 'verify' },
  { id: 'em-cebu', label: 'Cebu Pacific customer service', phone: '', note: 'Add from your booking confirmation.', status: 'verify' },
  { id: 'em-pal', label: 'PAL customer service', phone: '', note: 'Add from your booking confirmation.', status: 'verify' },
];

export const ARRIVAL_CHECKLIST = [
  'Disembark — keep Aya and the backpack together',
  'Immigration',
  'Baggage claim (Gilbert\'s 20 kg bag)',
  'Customs',
  'Phone connectivity / eSIM working?',
  'Find a suitable ATM',
  'Withdraw initial cash if needed (proposed HK$1,500 — check Wise balance, fees, limits)',
  'Open Uber',
  'Select the Car Seat (1–7 yo) ride if available',
  'Follow the current Uber pickup instructions',
  'Travel to Rambler Oasis Hotel',
];

export const GUIDE: { title: string; items: string[] }[] = [
  { title: 'Getting around with a toddler', items: [
    'MTR stations have lifts and the MTR is the quickest way for family journeys — check the MTR app for step-free routes.',
    'Uber with a Car Seat (1–7 yo) option is available in some rides; it can\'t be guaranteed.',
    'Hong Kong drives on the left. Wait for the full green man before crossing.',
    'Keep Aya\'s hands and the stroller inside the doors on busy trains.',
  ] },
  { title: 'Money', items: [
    'Currency is the Hong Kong dollar (HKD). Use the Expenses tab for HKD and PHP.',
    'Check your Wise card\'s ATM fees and limits before the trip.',
    'Tipping is not generally expected — check bills for a service charge.',
  ] },
  { title: 'Weather & clothing', items: [
    'December is usually mild and dry. Pack light layers; air-conditioned rooms and trains can feel cold.',
    'Check the forecast on the Home screen when it is within range.',
  ] },
  { title: 'Practical', items: [
    'Hong Kong uses 220 V, UK-style 3-pin (Type G) plugs.',
    'Public restrooms are common in malls and MTR-linked complexes. Look for family / baby-care rooms.',
    'Keep original QR tickets in the app wallet and turn your screen brightness up before scanning.',
  ] },
];

// Your own to-buy list lives in the app (More → Shopping). Starts empty on purpose.
export const SHOPPING: ShoppingItem[] = [];
export const SHOP_WHO = ['Family', 'Keren', 'Gilbert', 'Aya', 'Pasalubong / gifts'];
