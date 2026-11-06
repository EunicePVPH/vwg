// All trip content lives here, separate from the UI. Anything you can change in the
// app is stored as an edit on top of this file, so you never need to rebuild to
// update times, costs or booking details.
import type { ShoppingItem, Activity, Day, EmergencyItem, Expense, Flight, HealthItem, Hotel, PackItem, Restaurant, Task, Ticket } from '../types';

export const SEED_VERSION = 1;

export const FAMILY = [
  { name: 'Keren', role: 'Mom', color: 'pink' },
  { name: 'Gilbert', role: 'Dad', color: 'sky' },
  { name: 'Aya', role: 'Our 2-year-old', color: 'sun' },
] as const;

export const LINKS = {
  peak: 'https://www.thepeak.com.hk',
  oceanpark: 'https://www.oceanpark.com.hk',
  disney: 'https://www.hongkongdisneyland.com',
  science: 'https://hk.science.museum',
  klook: 'https://www.klook.com',
  mtr: 'https://www.mtr.com.hk',
  starferry: 'https://www.starferry.com.hk',
  airport: 'https://www.hongkongairport.com',
  cebu: 'https://www.cebupacificair.com',
  pal: 'https://www.philippineairlines.com',
  uber: 'https://www.uber.com',
  hko: 'https://www.hko.gov.hk',
  bicol: 'https://www.google.com/maps/search/?api=1&query=Bicol+International+Airport+Daraga',
};

export const DAYS: Day[] = [
  { id: 1, date: '2026-12-07', weekday: 'Monday', title: 'The Journey Begins', subtitle: 'Goa → Daraga → Manila → Hong Kong → Rambler Oasis',
    route: ['Goa', 'Daraga', 'Manila', 'Hong Kong', 'Hotel'], routeModes: ['car', 'plane', 'plane', 'uber'], photoKey: 'airport', accent: 'sky',
    summaryNote: '' },
  { id: 2, date: '2026-12-08', weekday: 'Tuesday', title: 'Mountains, Pandas & Hong Kong Lights', subtitle: 'Peak Tram → Ocean Park → Observation Wheel',
    route: ['Hotel', 'The Peak', 'Ocean Park', 'Central Wheel', 'Hotel'], routeModes: ['uber', 'uber', 'uber', 'uber'], photoKey: 'peak', accent: 'coral',
    summaryNote: '' },
  { id: 3, date: '2026-12-09', weekday: 'Wednesday', title: 'Dinosaurs & Science Fun', subtitle: 'Tsing Yi → Science Museum → rest → optional evening',
    route: ['Hotel', 'Tsing Yi MTR', 'Nam Cheong', 'East TST', 'Science Museum'], routeModes: ['bus', 'mtr', 'mtr', 'walk'], photoKey: 'science', accent: 'turq',
    summaryNote: '' },
  { id: 4, date: '2026-12-10', weekday: 'Thursday', title: 'Disney Magic Day', subtitle: 'Hong Kong Disneyland + official PhotoPass photos',
    route: ['Hotel', 'Tsing Yi', 'Sunny Bay', 'Disneyland'], routeModes: ['bus', 'mtr', 'mtr'], photoKey: 'disney', accent: 'lav',
    summaryNote: '' },
  { id: 5, date: '2026-12-11', weekday: 'Friday', title: 'Home Again', subtitle: 'Hong Kong → Manila → Daraga → Goa',
    route: ['Hotel', 'HK Airport', 'Manila', 'Daraga', 'Goa'], routeModes: ['uber', 'plane', 'plane', 'car'], photoKey: 'harbour', accent: 'sun',
    summaryNote: '' },
];

const A = (a: Activity): Activity => a;

export const ACTIVITIES: Activity[] = [
  // ───────── DAY 1 ─────────
  A({ id: 'a1-01', day: 1, start: '00:30', end: '04:45', title: 'Leave home in Goa for Bicol International Airport', kind: 'travel', priority: 'must', status: 'verify', mode: 'car',
    place: 'Bicol International Airport, Daraga, Albay',
    notes: 'Drive time is NOT confirmed. Check Google Maps for the live estimate and edit the times here. The planning window below leaves room for stops with Aya.',
    tips: ['Check the drive time in Google Maps before the trip and edit this card.', 'Keep Aya\'s snacks, water and a change of clothes in the front seat.'],
    link: { label: 'Route in Google Maps', url: 'https://www.google.com/maps/dir/?api=1&destination=Bicol+International+Airport+Daraga&travelmode=driving' } }),
  A({ id: 'a1-02', day: 1, start: '04:45', end: '05:45', title: 'Arrive at Bicol airport · check in · security · snacks', kind: 'travel', priority: 'must', status: 'verify', place: 'Bicol International Airport',
    notes: 'Planning target: about 2 hours before departure. Confirm PAL\'s current check-in cut-off on your booking. PAL domestic tickets include no free checked bag — baggage purchase is still PENDING.',
    tips: ['Buy the PAL checked-baggage allowance before this morning if possible (see Travel Ready).', 'Restroom + diaper change before security.'], restroom: 'Use the airport restroom before boarding.' }),
  A({ id: 'a1-03', day: 1, start: '06:45', end: '07:45', title: 'PAL PR2922 · Daraga (DRP) → Manila (MNL)', kind: 'flight', priority: 'must', status: 'confirmed', mode: 'plane', flightId: 'f1',
    notes: 'Seats: Keren 37H · Aya 37J · Gilbert 37K. Arrive NAIA Terminal 2 at 7:45 AM.' }),
  A({ id: 'a1-04', day: 1, start: '07:45', end: '08:30', title: 'Land at NAIA Terminal 2 · collect luggage', kind: 'travel', priority: 'must', status: 'confirmed', place: 'NAIA Terminal 2',
    notes: 'PAL and Cebu Pacific are separate bookings. Do NOT assume bags are checked through — collect everything.', tips: ['Gilbert carries Aya\'s essentials backpack.'] }),
  A({ id: 'a1-05', day: 1, start: '08:30', end: '09:30', title: 'Transfer NAIA Terminal 2 → Terminal 3', kind: 'travel', priority: 'must', status: 'verify', mode: 'bus', place: 'NAIA Terminal 3',
    notes: 'Find the airport transfer service between terminals, or an appropriate alternative (taxi / ride-hail). Check what is currently available when you arrive. Fare/availability not confirmed.',
    alt: 'Alternative: taxi or ride-hail from the arrivals curb. Allow extra time for traffic.', costHKD: null }),
  A({ id: 'a1-06', day: 1, start: '09:30', end: '10:00', title: 'Collect the rented stroller', kind: 'task', priority: 'must', status: 'pending', place: 'NAIA Terminal 3',
    notes: 'Stroller-rental company details and the handover point are still PENDING. Message the provider on arrival and confirm the meeting spot. Add their name/number in Travel Ready.',
    tips: ['Message them before you land at Terminal 2.'] }),
  A({ id: 'a1-07', day: 1, start: '10:00', end: '10:20', title: 'Pay Aya\'s remaining travel tax (if still unpaid)', kind: 'task', priority: 'normal', status: 'pending', place: 'NAIA Terminal 3',
    notes: 'Only if still unpaid. Confirm the right counter and the amount at the airport — not yet verified.' }),
  A({ id: 'a1-08', day: 1, start: '10:20', end: '11:20', title: 'Breakfast / early meal at Terminal 3', kind: 'meal', priority: 'normal', status: 'estimated', place: 'NAIA Terminal 3 restaurants', cat: 'Food', costHKD: null,
    notes: 'Costs are in pesos here — log the real amount in Expenses.' }),
  A({ id: 'a1-09', day: 1, start: '11:20', end: '12:30', title: 'Rest in free airport seating', kind: 'rest', priority: 'normal', status: 'optional', nap: true,
    notes: 'Find free seating where Gilbert and Aya can rest. No paid lounge or luggage storage needed.' }),
  A({ id: 'a1-10', day: 1, start: '12:30', end: '13:30', title: 'Check in & drop luggage — Cebu Pacific (T3)', kind: 'travel', priority: 'must', status: 'verify', place: 'NAIA Terminal 3 Cebu Pacific check-in',
    notes: 'Counters open at a time set by Cebu Pacific — check your booking and edit this card. Cebu Pacific baggage: one 20 kg checked bag (Gilbert) each international direction, per your booking.' }),
  A({ id: 'a1-11', day: 1, start: '13:30', end: '14:30', title: 'Immigration & security', kind: 'travel', priority: 'must', status: 'estimated', tips: ['Have passports, boarding passes and Aya\'s documents together in one pouch.'] }),
  A({ id: 'a1-12', day: 1, start: '14:30', end: '15:00', title: 'Find gate · family area · board', kind: 'travel', priority: 'must', status: 'estimated', restroom: 'Last restroom stop + diaper change before boarding.' }),
  A({ id: 'a1-13', day: 1, start: '15:15', end: '18:00', title: 'Cebu Pacific 5J112 · Manila (MNL T3) → Hong Kong (HKG)', kind: 'flight', priority: 'must', status: 'confirmed', mode: 'plane', flightId: 'f2',
    notes: 'Seats: Gilbert 21A · Aya 21B · Keren 21C. Arrival terminal per ticket: Hong Kong Terminal 1.' }),
  A({ id: 'a1-14', day: 1, start: '18:00', end: '19:15', title: 'Arrive Hong Kong · immigration', kind: 'travel', priority: 'must', status: 'confirmed', place: 'Hong Kong International Airport Terminal 1',
    tips: ['Use the airport arrival checklist below (Day 1 → Arrival checklist).'] }),
  A({ id: 'a1-15', day: 1, start: '19:15', end: '19:50', title: 'Baggage claim · customs · eSIM check · ATM', kind: 'travel', priority: 'must', status: 'estimated',
    notes: 'Proposed first cash withdrawal: HK$1,500 — depending on your actual Wise balance, ATM fees and limits. A withdrawal is cash in hand, not a spend.' }),
  A({ id: 'a1-16', day: 1, start: '19:50', end: '20:40', title: 'Uber (Car Seat 1–7 yo) to Rambler Oasis Hotel', kind: 'travel', priority: 'must', status: 'estimated', mode: 'uber', place: 'Rambler Oasis Hotel, 1 Tsing Yi Road, Tsing Yi', costHKD: 300, cat: 'Transport',
    notes: 'Select the Car Seat (1–7 yo) option if the app offers it; availability is not guaranteed. Follow Uber\'s current airport pickup instructions in the app.',
    alt: 'Alternative: Airport Express to Tsing Yi station, then the hotel (verify route, fare and stroller access).' }),
  A({ id: 'a1-17', day: 1, start: '20:40', end: '21:10', title: 'Hotel check-in (from 2:00 PM)', kind: 'hotel', priority: 'must', status: 'confirmed', place: 'Rambler Oasis Hotel, Tsing Yi',
    notes: 'Standard Twin Room · 2 adults + 1 child. Local tax HK$56.60 is payable at the hotel; a HK$500 deposit is listed — record how you pay it in the Hotel page.' }),
  A({ id: 'a1-18', day: 1, start: '21:10', end: '22:00', title: 'Dinner near Rambler Plaza + water, snacks, breakfast supplies', kind: 'meal', priority: 'normal', status: 'estimated', place: 'Rambler Plaza Tsing Yi', cat: 'Food', costHKD: 250 }),
  A({ id: 'a1-19', day: 1, start: '22:00', end: '22:30', title: 'Get ready for tomorrow · sleep', kind: 'rest', priority: 'normal', status: 'confirmed', notes: 'No sightseeing tonight. Big day tomorrow: wake around 6:30 AM.' }),

  // ───────── DAY 2 ─────────
  A({ id: 'a2-01', day: 2, start: '06:30', end: '07:00', title: 'Wake up · breakfast · get ready', kind: 'rest', priority: 'normal', status: 'confirmed' }),
  A({ id: 'a2-02', day: 2, start: '07:00', end: '07:40', title: 'Uber (child seat) to Peak Tram Lower Terminus', kind: 'travel', priority: 'must', status: 'estimated', mode: 'uber', place: 'Peak Tram Lower Terminus, 33 Garden Road, Central', cat: 'Transport', costHKD: 280,
    notes: '33 Garden Road, Central. Peak Tram opens 7:30 AM.' }),
  A({ id: 'a2-03', day: 2, start: '07:45', end: '08:15', title: 'Peak Tram — queue and ride up', kind: 'sight', priority: 'must', status: 'pending', mode: 'tram', ticketId: 't-peak', place: 'Peak Tram Lower Terminus, Central', cat: 'Attractions', costHKD: null,
    notes: 'Peak Tram + Sky Terrace tickets are NOT YET PURCHASED. These are planning targets, not guaranteed ride slots.', stroller: 'Check stroller rules at the terminus.', link: { label: 'Official site', url: LINKS.peak } }),
  A({ id: 'a2-04', day: 2, start: '08:30', end: '09:15', title: 'Sky Terrace 428 · family photos', kind: 'sight', priority: 'must', status: 'pending', ticketId: 't-peak', place: 'Sky Terrace 428, The Peak', notes: 'Sky Terrace 428 opens 8:30 AM.', stroller: 'Confirm stroller access at the Peak Tower.' }),
  A({ id: 'a2-05', day: 2, start: '09:15', end: '09:45', title: 'Come down · regroup · prepare for transfer', kind: 'rest', priority: 'normal', status: 'estimated', mode: 'tram', restroom: 'Restroom + diaper change before the car ride.' }),
  A({ id: 'a2-06', day: 2, start: '09:45', end: '10:30', title: 'Uber (child seat) to Ocean Park', kind: 'travel', priority: 'must', status: 'estimated', mode: 'uber', place: 'Ocean Park Hong Kong', cat: 'Transport', costHKD: 150, notes: 'Target arrival about 10:30 AM. Eat a snack before leaving.' }),
  A({ id: 'a2-07', day: 2, start: '10:30', end: '11:15', title: 'Giant Panda Adventure', kind: 'sight', priority: 'must', status: 'confirmed', ticketId: 't-oceanpark', place: 'Ocean Park Hong Kong', notes: 'Ocean Park tickets for two adults are already purchased. Aya (under 3) enters free.', stroller: 'Stroller-friendly paths — check the official park map.' }),
  A({ id: 'a2-08', day: 2, start: '11:15', end: '12:15', title: 'Grand Aquarium', kind: 'sight', priority: 'must', status: 'confirmed', place: 'Ocean Park Hong Kong' }),
  A({ id: 'a2-09', day: 2, start: '12:15', end: '13:15', title: 'Lunch at Club Panda (or verified nearby alternative)', kind: 'meal', priority: 'normal', status: 'verify', place: 'Club Panda Ocean Park', cat: 'Food', costHKD: 400, notes: 'Check Club Panda is open and has a table for 3 before you commit.' }),
  A({ id: 'a2-10', day: 2, start: '13:15', end: '15:15', title: 'Nap window — Aya sleeps in stroller', kind: 'rest', priority: 'normal', status: 'optional', nap: true, notes: 'Aya usually naps 2–3 hours. Keep the pace quiet and shaded. Adjust to her actual sleepiness.' }),
  A({ id: 'a2-11', day: 2, start: '15:15', end: '15:45', title: 'Waterfront-to-Summit Cable Car', kind: 'sight', priority: 'normal', status: 'confirmed', mode: 'cable', place: 'Ocean Park Cable Car Waterfront', stroller: 'Check stroller handling at the cable car station.', tips: ['If the line is long or Aya is still asleep, take the Ocean Express instead (verify).'] }),
  A({ id: 'a2-12', day: 2, start: '15:45', end: '16:15', title: 'South Pole Spectacular — penguins', kind: 'sight', priority: 'must', status: 'confirmed', place: 'Ocean Park Hong Kong' }),
  A({ id: 'a2-13', day: 2, start: '16:15', end: '16:35', title: 'Shark Mystique', kind: 'sight', priority: 'normal', status: 'confirmed' }),
  A({ id: 'a2-14', day: 2, start: '16:35', end: '16:55', title: 'Sea Jelly Spectacular', kind: 'sight', priority: 'normal', status: 'confirmed' }),
  A({ id: 'a2-15', day: 2, start: '16:55', end: '17:15', title: 'Ocean Express back to Waterfront · exit', kind: 'travel', priority: 'normal', status: 'confirmed', mode: 'tram',
    notes: 'Target exit about 5:15 PM — keep flexible. Bonus if time: Pacific Pier, meerkats & tortoises, Ocean Park Tower, gentle children\'s experiences.',
    tips: ['FasTrack is NOT purchased by default. Decide on the day based on crowds and the attractions it covers.'] }),
  A({ id: 'a2-16', day: 2, start: '17:15', end: '17:55', title: 'Uber (child seat) to Central Harbourfront', kind: 'travel', priority: 'must', status: 'estimated', mode: 'uber', place: 'Hong Kong Observation Wheel, 33 Man Kwong Street, Central', cat: 'Transport', costHKD: 200 }),
  A({ id: 'a2-17', day: 2, start: '18:00', end: '18:45', title: 'Hong Kong Observation Wheel', kind: 'sight', priority: 'must', status: 'confirmed', ticketId: 't-wheel', place: 'Hong Kong Observation Wheel, 33 Man Kwong Street, Central',
    notes: 'Two adult tickets already purchased for Dec 8 (Klook). Aya enters free. Show the ORIGINAL Klook voucher QR codes. Check your voucher for any time slot and edit this card.',
    stroller: 'The stroller cannot go in the gondola. Use the designated stroller storage — check the posted fee and collection conditions on site (not confirmed).' }),
  A({ id: 'a2-18', day: 2, start: '18:45', end: '20:15', title: 'Optional: Central Pier 7 · Star Ferry · Symphony of Lights (8 PM)', kind: 'show', priority: 'optional', status: 'optional', mode: 'ferry', place: 'Central Pier 7 Star Ferry',
    notes: 'Optional, not mandatory. Optional extras: waterfront photos, HK1 night sightseeing bus (check its schedule). If Aya is tired, skip this and go straight to the hotel.', link: { label: 'Star Ferry', url: LINKS.starferry } }),
  A({ id: 'a2-19', day: 2, start: '20:15', end: '21:15', title: 'Uber back to Rambler Oasis · late meal or takeaway', kind: 'travel', priority: 'normal', status: 'estimated', mode: 'uber', place: 'Rambler Oasis Hotel, Tsing Yi', cat: 'Transport', costHKD: 280,
    notes: 'Don\'t risk an exhausting night for optional sightseeing. If tired, leave right after the Wheel.' }),

  // ───────── DAY 3 ─────────
  A({ id: 'a3-01', day: 3, start: '07:45', end: '08:35', title: 'Wake up · breakfast · get ready', kind: 'rest', priority: 'normal', status: 'confirmed' }),
  A({ id: 'a3-02', day: 3, start: '08:40', end: '08:55', title: 'Hotel shuttle / minibus → Tsing Yi MTR', kind: 'travel', priority: 'normal', status: 'verify', mode: 'bus', place: 'Tsing Yi MTR Station',
    notes: 'The hotel shuttle schedule is NOT confirmed — ask the hotel (+852 2129 1888) and edit this card. Alternative: Uber or walk.' }),
  A({ id: 'a3-03', day: 3, start: '08:55', end: '09:40', title: 'MTR Tung Chung Line → Nam Cheong → Tuen Ma Line → East Tsim Sha Tsui', kind: 'travel', priority: 'must', status: 'estimated', mode: 'mtr', place: 'East Tsim Sha Tsui Station', cat: 'Transport', costHKD: 60,
    notes: 'Estimated fares and timing — check the MTR app on the day.', stroller: 'Use lifts; allow extra time at interchange.', link: { label: 'MTR', url: LINKS.mtr } }),
  A({ id: 'a3-04', day: 3, start: '09:40', end: '10:00', title: 'Walk to the Hong Kong Science Museum', kind: 'travel', priority: 'normal', status: 'verify', mode: 'walk', place: 'Hong Kong Science Museum, Tsim Sha Tsui East', stroller: 'Check the step-free route from the station exit.' }),
  A({ id: 'a3-05', day: 3, start: '10:00', end: '12:30', title: 'Hong Kong Science Museum — dinosaurs & hands-on exhibits', kind: 'sight', priority: 'must', status: 'verify', ticketId: 't-science', place: 'Hong Kong Science Museum, Tsim Sha Tsui East', cat: 'Attractions', costHKD: null,
    notes: 'Verify opening days/hours, ticket price and which dinosaur or children\'s exhibits are open on Dec 9. Ticket status is not confirmed.', link: { label: 'Official site', url: LINKS.science } }),
  A({ id: 'a3-06', day: 3, start: '12:30', end: '13:30', title: 'Lunch near the museum', kind: 'meal', priority: 'normal', status: 'estimated', place: 'restaurants near Hong Kong Science Museum Tsim Sha Tsui East', cat: 'Food', costHKD: 350 }),
  A({ id: 'a3-07', day: 3, start: '13:30', end: '16:00', title: 'Nap window — back to the hotel (or stroller nap on the waterfront)', kind: 'rest', priority: 'normal', status: 'optional', nap: true, mode: 'mtr',
    notes: 'Aya naps 2–3 hours. Going back to the hotel gives her a proper bed; a waterfront stroll lets her nap while you rest. Pick on the day.' }),
  A({ id: 'a3-08', day: 3, start: '16:00', end: '17:30', title: 'Optional: Kowloon Park or waterfront stroll', kind: 'sight', priority: 'optional', status: 'optional', mode: 'walk', place: 'Kowloon Park, Tsim Sha Tsui', notes: 'Gentle, flexible. Verify what is open and the route from the museum.' }),
  A({ id: 'a3-09', day: 3, start: '17:30', end: '18:30', title: 'Early dinner', kind: 'meal', priority: 'normal', status: 'estimated', place: 'family restaurants Tsim Sha Tsui', cat: 'Food', costHKD: 350 }),
  A({ id: 'a3-10', day: 3, start: '18:30', end: '20:30', title: 'Optional: Temple Street Night Market', kind: 'sight', priority: 'optional', status: 'optional', place: 'Temple Street Night Market, Yau Ma Tei', mode: 'mtr',
    notes: 'Crowded and busy for a stroller. Only if Aya has energy.' }),
  A({ id: 'a3-11', day: 3, start: '20:30', end: '21:30', title: 'Return to the hotel', kind: 'travel', priority: 'normal', status: 'estimated', mode: 'uber', place: 'Rambler Oasis Hotel, Tsing Yi', cat: 'Transport', costHKD: 250, alt: 'Alternative: MTR back to Tsing Yi if it is not too late.' }),

  // ───────── DAY 4 ─────────
  A({ id: 'a4-01', day: 4, start: '06:45', end: '07:45', title: 'Wake up · breakfast · pack Aya\'s backpack', kind: 'rest', priority: 'normal', status: 'confirmed' }),
  A({ id: 'a4-02', day: 4, start: '08:00', end: '09:15', title: 'Tsing Yi → Sunny Bay → Disneyland Resort (MTR)', kind: 'travel', priority: 'must', status: 'estimated', mode: 'mtr', place: 'Disneyland Resort Station', cat: 'Transport', costHKD: 60,
    notes: 'Tung Chung Line to Sunny Bay, then the Disneyland Resort Line. Verify the route and timing in the MTR app.', stroller: 'Lifts at stations; keep the stroller folded on busy platforms if asked.', link: { label: 'MTR', url: LINKS.mtr } }),
  A({ id: 'a4-03', day: 4, start: '09:15', end: '10:00', title: 'Arrive for park opening · enter', kind: 'sight', priority: 'must', status: 'verify', ticketId: 't-disney', place: 'Hong Kong Disneyland',
    notes: 'Park opening time and our ticket status must be verified from official Disney information. Show original tickets from the Tickets tab.', link: { label: 'Official Disney site', url: LINKS.disney } }),
  A({ id: 'a4-04', day: 4, start: '10:00', end: '10:30', title: 'PhotoPass: Main Street, U.S.A. family photos', kind: 'sight', priority: 'must', status: 'verify', place: 'Main Street USA Hong Kong Disneyland', ticketId: 't-photopass',
    notes: 'Official Disney PhotoPass photographers only. Photograph all three of us while everyone is fresh. Locations and availability must be verified from official Disney information.' }),
  A({ id: 'a4-05', day: 4, start: '10:30', end: '11:00', title: 'PhotoPass: Castle of Magical Dreams', kind: 'sight', priority: 'must', status: 'verify', place: 'Castle of Magical Dreams Hong Kong Disneyland', ticketId: 't-photopass' }),
  A({ id: 'a4-06', day: 4, start: '11:00', end: '11:45', title: 'PhotoPass: World of Frozen & participating character photo spots', kind: 'sight', priority: 'normal', status: 'verify', place: 'World of Frozen Hong Kong Disneyland', ticketId: 't-photopass', notes: 'Allow time for PhotoPass queues without rushing.' }),
  A({ id: 'a4-07', day: 4, start: '11:45', end: '13:00', title: 'Gentle attractions (e.g. Mickey\'s PhilharMagic, "it\'s a small world", Winnie the Pooh)', kind: 'sight', priority: 'normal', status: 'verify', place: 'Hong Kong Disneyland',
    notes: 'Suggestions only — verify what is open. Skip spinning or fast rides.' }),
  A({ id: 'a4-08', day: 4, start: '13:00', end: '14:00', title: 'Lunch', kind: 'meal', priority: 'normal', status: 'estimated', place: 'Hong Kong Disneyland restaurants', cat: 'Food', costHKD: 500, notes: 'Pick a stroller-friendly spot from the official map.' }),
  A({ id: 'a4-09', day: 4, start: '14:00', end: '16:00', title: 'Nap window — Aya sleeps in stroller', kind: 'rest', priority: 'normal', status: 'optional', nap: true, notes: 'Quiet gardens or a show seat (check showtimes) while Aya naps.' }),
  A({ id: 'a4-10', day: 4, start: '16:00', end: '18:00', title: 'More gentle rides · character moments · Fairy Tale Forest', kind: 'sight', priority: 'normal', status: 'verify', place: 'Hong Kong Disneyland' }),
  A({ id: 'a4-11', day: 4, start: '18:00', end: '19:00', title: 'Dinner', kind: 'meal', priority: 'normal', status: 'estimated', cat: 'Food', costHKD: 500, place: 'Hong Kong Disneyland restaurants' }),
  A({ id: 'a4-12', day: 4, start: '19:30', end: '20:15', title: 'Momentous — evening spectacular', kind: 'show', priority: 'must', status: 'verify', place: 'Hong Kong Disneyland Main Street USA', notes: 'Show time and viewing areas must be verified from official Disney information. If Aya is asleep, go early to a calm spot.' }),
  A({ id: 'a4-13', day: 4, start: '20:15', end: '21:30', title: 'Direct return to Rambler Oasis (MTR via Sunny Bay)', kind: 'travel', priority: 'must', status: 'estimated', mode: 'mtr', place: 'Rambler Oasis Hotel, Tsing Yi', cat: 'Transport', costHKD: 60,
    alt: 'Alternative: Uber with child seat if the crowd is heavy or Aya is asleep.' }),

  // ───────── DAY 5 ─────────
  A({ id: 'a5-01', day: 5, start: '05:45', end: '06:30', title: 'Wake up · final pack · check the room', kind: 'rest', priority: 'must', status: 'confirmed', tips: ['Passports, boarding passes and all original tickets in one pouch.'] }),
  A({ id: 'a5-02', day: 5, start: '06:30', end: '07:00', title: 'Breakfast · check out', kind: 'hotel', priority: 'must', status: 'verify', place: 'Rambler Oasis Hotel, Tsing Yi',
    notes: 'Check-out is by noon, but we leave early. Settle the HK$56.60 local tax if not yet paid, and confirm your HK$500 deposit status.' }),
  A({ id: 'a5-03', day: 5, start: '07:00', end: '07:45', title: 'Travel to Hong Kong International Airport', kind: 'travel', priority: 'must', status: 'estimated', mode: 'uber', place: 'Hong Kong International Airport', cat: 'Transport', costHKD: 300,
    alt: 'Alternative: Airport Express from Tsing Yi station (verify route, fare and stroller access).' }),
  A({ id: 'a5-04', day: 5, start: '07:45', end: '09:00', title: 'Cebu Pacific check-in & bag drop', kind: 'travel', priority: 'must', status: 'verify', place: 'Hong Kong International Airport Terminal 2',
    notes: 'CHECK-IN is currently said to be at Terminal 2, while BOARDING is at the Terminal 1 area. Verify Cebu Pacific\'s current instructions and the connection between the two before departure.', link: { label: 'Airport info', url: LINKS.airport } }),
  A({ id: 'a5-05', day: 5, start: '09:00', end: '10:15', title: 'Immigration · security · snack', kind: 'travel', priority: 'must', status: 'estimated' }),
  A({ id: 'a5-06', day: 5, start: '10:15', end: '11:00', title: 'Go to the gate · board', kind: 'travel', priority: 'must', status: 'verify', notes: 'Return seats are currently unassigned.' }),
  A({ id: 'a5-07', day: 5, start: '11:00', end: '13:30', title: 'Cebu Pacific 5J111 · Hong Kong → Manila (NAIA T3)', kind: 'flight', priority: 'must', status: 'confirmed', mode: 'plane', flightId: 'f3' }),
  A({ id: 'a5-08', day: 5, start: '13:30', end: '15:30', title: 'TIME-SENSITIVE CONNECTION: immigration · bags · return stroller · T3 → T2', kind: 'travel', priority: 'must', status: 'verify', place: 'NAIA Terminal 2',
    notes: 'Separately booked connection (Cebu Pacific then PAL). 4 h 5 min between landing and the PAL flight. Immigration, baggage collection, stroller rental return and the terminal transfer all fit inside this window. Stroller return details are pending. If 5J111 is delayed, contact PAL right away — separate tickets are not protected.' }),
  A({ id: 'a5-09', day: 5, start: '15:30', end: '17:00', title: 'PAL check-in (T2) · bag drop · snack · security', kind: 'travel', priority: 'must', status: 'verify', place: 'NAIA Terminal 2 PAL check-in', notes: 'Confirm PAL\'s current check-in cut-off. Checked baggage for PAL is purchased separately.' }),
  A({ id: 'a5-10', day: 5, start: '17:35', end: '18:45', title: 'PAL PR2925 · Manila (T2) → Daraga (DRP)', kind: 'flight', priority: 'must', status: 'confirmed', mode: 'plane', flightId: 'f4', notes: 'Seats: Keren 38J · Aya 38H · Gilbert 38K.' }),
  A({ id: 'a5-11', day: 5, start: '18:45', end: '19:30', title: 'Land in Daraga · bags · head home to Goa', kind: 'travel', priority: 'normal', status: 'verify', mode: 'car', place: 'Bicol International Airport, Daraga, Albay', notes: 'Drive home duration not confirmed — check Google Maps.' }),
];

export const TICKETS: Ticket[] = [
  { id: 't-peak', name: 'Peak Tram + Sky Terrace 428', photoKey: 'peak', dayId: 2, date: '2026-12-08', type: 'Peak Tram + Sky Terrace combo', status: 'pending', statusLabel: 'Not yet purchased',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (under-3 policy: verify)' }],
    notes: 'Peak Tram opens 7:30 AM · Sky Terrace 428 opens 8:30 AM. Buy ahead and import the tickets here.', place: 'Peak Tram Lower Terminus, 33 Garden Road, Central',
    restrictions: ['Check the current ticket terms on the official site.'], bookingUrl: LINKS.peak, bookingLabel: 'Open official site' },
  { id: 't-oceanpark', name: 'Ocean Park Hong Kong', photoKey: 'oceanpark', dayId: 2, date: '2026-12-08', type: 'General admission', status: 'confirmed',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (under 3 — free entry)' }],
    notes: 'Two adult tickets purchased. FasTrack is optional and not purchased.', place: 'Ocean Park Hong Kong',
    restrictions: ['Check ticket validity and entry rules on the official site.'], bookingUrl: LINKS.oceanpark, bookingLabel: 'Open Ocean Park site' },
  { id: 't-wheel', name: 'Hong Kong Observation Wheel', photoKey: 'wheel', dayId: 2, date: '2026-12-08', type: 'Klook voucher · 2 adult tickets', status: 'confirmed',
    guests: [{ label: 'Keren (adult) — original Klook QR' }, { label: 'Gilbert (adult) — original Klook QR' }, { label: 'Aya (under 3 — free)' }],
    notes: 'Show the ORIGINAL Klook voucher QR codes. The stroller cannot go into the gondola — use stroller storage and check the posted fee on site.', place: '33 Man Kwong Street, Central',
    restrictions: ['No stroller in the gondola.'], bookingUrl: LINKS.klook, bookingLabel: 'Open Klook' },
  { id: 't-science', name: 'Hong Kong Science Museum', photoKey: 'science', dayId: 3, date: '2026-12-09', type: 'Admission — to verify', status: 'verify',
    guests: [{ label: 'Keren' }, { label: 'Gilbert' }, { label: 'Aya' }], notes: 'Ticket needs and pricing for Dec 9 are not confirmed. Check the official site.', place: 'Hong Kong Science Museum, Tsim Sha Tsui East',
    bookingUrl: LINKS.science, bookingLabel: 'Open official site' },
  { id: 't-disney', name: 'Hong Kong Disneyland', photoKey: 'disney', dayId: 4, date: '2026-12-10', type: 'Park admission — to verify', status: 'verify',
    guests: [{ label: 'Keren (adult)' }, { label: 'Gilbert (adult)' }, { label: 'Aya (age policy: verify)' }],
    notes: 'Your brief did not say if Disneyland tickets are purchased. Update the status once you know.', place: 'Hong Kong Disneyland',
    bookingUrl: LINKS.disney, bookingLabel: 'Open official Disney site' },
  { id: 't-photopass', name: 'Disney PhotoPass', photoKey: 'disney', dayId: 4, date: '2026-12-10', type: 'Official PhotoPass service (no outside photographer)', status: 'pending', statusLabel: 'Not yet purchased',
    guests: [{ label: 'Keren, Gilbert & Aya — family photos' }],
    notes: 'We use official Disneyland PhotoPass photographers only. Package prices and options must be verified on the official site. Review and download all photos after the visit.',
    restrictions: ['Locations, availability and times: verify from official Disney information.'], place: 'Hong Kong Disneyland', bookingUrl: LINKS.disney, bookingLabel: 'Official Disney site' },
];

export const FLIGHTS: Flight[] = [
  { id: 'f1', airline: 'Philippine Airlines (PAL Express)', code: 'PR2922', from: 'Daraga', fromCode: 'DRP', to: 'Manila', toCode: 'MNL', date: '2026-12-07', dep: '06:45', arr: '07:45', arrTerminal: 'NAIA Terminal 2',
    seats: [{ who: 'Keren', seat: '37H' }, { who: 'Aya', seat: '37J' }, { who: 'Gilbert', seat: '37K' }], baggage: 'PAL: no free checked baggage on the current domestic receipts. Checked-baggage allowance still to be bought (PENDING).', carryOn: 'Confirm PAL carry-on rules on your ticket.', status: 'confirmed', bookingUrl: LINKS.pal },
  { id: 'f2', airline: 'Cebu Pacific', code: '5J112', from: 'Manila', fromCode: 'MNL', to: 'Hong Kong', toCode: 'HKG', date: '2026-12-07', dep: '15:15', arr: '18:00', depTerminal: 'NAIA Terminal 3', arrTerminal: 'Hong Kong Terminal 1 (per ticket)',
    seats: [{ who: 'Gilbert', seat: '21A' }, { who: 'Aya', seat: '21B' }, { who: 'Keren', seat: '21C' }], baggage: 'Cebu Pacific: one 20 kg checked bag for Gilbert (per booking).', carryOn: 'Carry-on and personal item: confirm from your active ticket and Cebu Pacific rules.', status: 'confirmed',
    notes: '7 h 30 min between the two scheduled flights on Dec 7. Separate airlines — bags are not checked through.', bookingUrl: LINKS.cebu },
  { id: 'f3', airline: 'Cebu Pacific', code: '5J111', from: 'Hong Kong', fromCode: 'HKG', to: 'Manila', toCode: 'MNL', date: '2026-12-11', dep: '11:00', arr: '13:30', arrTerminal: 'NAIA Terminal 3',
    seats: [], baggage: 'Cebu Pacific: one 20 kg checked bag for Gilbert (per booking).', carryOn: 'Carry-on and personal item: confirm from your active ticket and Cebu Pacific rules.', status: 'confirmed',
    notes: 'Return seats currently unassigned. Check-in: verify Cebu Pacific\'s current Terminal 2 check-in instructions and the link to the Terminal 1 boarding area. Check-in and boarding are in different places.', bookingUrl: LINKS.cebu },
  { id: 'f4', airline: 'Philippine Airlines (PAL Express)', code: 'PR2925', from: 'Manila', fromCode: 'MNL', to: 'Daraga', toCode: 'DRP', date: '2026-12-11', dep: '17:35', arr: '18:45', depTerminal: 'NAIA Terminal 2',
    seats: [{ who: 'Keren', seat: '38J' }, { who: 'Gilbert', seat: '38K' }, { who: 'Aya', seat: '38H' }], baggage: 'PAL: no free checked baggage on the current domestic receipts. Checked-baggage allowance still to be bought (PENDING).', carryOn: 'Confirm PAL carry-on rules on your ticket.', status: 'confirmed',
    notes: 'TIME-SENSITIVE: 4 h 5 min after Cebu Pacific lands. Separate booking: immigration, baggage, stroller rental return and the T3 → T2 transfer all happen in between.', bookingUrl: LINKS.pal },
];

export const HOTEL: Hotel = {
  id: 'hotel', name: 'Rambler Oasis Hotel', address: '1 Tsing Yi Road, Tsing Yi, Hong Kong', addressZh: '',
  phone: '+852 2129 1888', checkIn: 'Monday, Dec 7 · from 2:00 PM', checkOut: 'Friday, Dec 11 · by 12:00 noon', room: 'Standard Twin Room', guests: '2 adults + 1 child', nights: 4, bookedVia: 'Expedia',
  totalUSD: 271.65, paidUSD: 264.44, localTaxHKD: 56.6, depositHKD: 500, depositStatus: 'unknown', paymentMethod: '',
  upgradeNote: 'We decided NOT to upgrade to the Business Room.',
  shuttleNote: 'Hotel shuttle schedule is NOT confirmed. Ask the hotel before relying on it.',
  notes: 'Chinese address not yet verified — tap Edit and paste it once the hotel confirms it.',
};

export const EXPENSES: Expense[] = [
  { id: 'e-pal', label: 'PAL domestic family tickets + seat charges', category: 'Flights', amount: 14784, currency: 'PHP', status: 'paid', kind: 'spend', note: 'Already paid' },
  { id: 'e-5j', label: 'Cebu Pacific international flights + add-ons', category: 'Flights', amount: 40815.93, currency: 'PHP', status: 'paid', kind: 'spend', note: 'Already paid' },
  { id: 'e-hotel', label: 'Rambler Oasis Hotel (paid via Expedia)', category: 'Hotel', amount: 264.44, currency: 'USD', status: 'paid', kind: 'spend', note: 'Already paid. Shown in pesos (converted from US$264.44 on Expedia) — tap to enter the exact pesos you were charged.' },
  { id: 'e-tax', label: 'Hotel local tax due at property', category: 'Hotel', amount: 56.6, currency: 'HKD', status: 'estimated', kind: 'spend', day: 1, note: 'Payable at check-in or check-out' },
  { id: 'e-deposit', label: 'Hotel deposit (listed HK$500 per stay)', category: 'Hotel', amount: 500, currency: 'HKD', status: 'estimated', kind: 'deposit', day: 1, note: 'Potentially refundable — not spending. Record method + refund status in Hotel.' },
  { id: 'e-cash', label: 'Planned first ATM withdrawal (Wise)', category: 'Cash', amount: 1500, currency: 'HKD', status: 'estimated', kind: 'cash', day: 1, note: 'Cash in hand, not an expense. Depends on Wise balance, ATM fees and limits.' },
  { id: 'e-palbag', label: 'PAL checked-baggage allowance (to buy)', category: 'Flights', amount: null, currency: 'PHP', status: 'estimated', kind: 'spend', note: 'PENDING — add the price once decided' },
  { id: 'e-ocean', label: 'Ocean Park tickets (2 adults, already bought)', category: 'Attractions', amount: null, currency: 'HKD', status: 'paid', kind: 'spend', day: 2, note: 'Already purchased — enter the amount from your receipt' },
  { id: 'e-wheel', label: 'Observation Wheel (2 adults, Klook, already bought)', category: 'Attractions', amount: null, currency: 'HKD', status: 'paid', kind: 'spend', day: 2, note: 'Already purchased — enter the amount from your receipt' },
  { id: 'e-photopass', label: 'Disney PhotoPass package', category: 'Disney PhotoPass', amount: null, currency: 'HKD', status: 'estimated', kind: 'spend', day: 4, note: 'NOT yet purchased. Add the verified official price, then the actual amount.' },
];

export const EXPENSE_CATEGORIES = ['Flights', 'Hotel', 'Transport', 'Food', 'Attractions', 'Disney PhotoPass', 'Shopping', 'Health', 'SIM / eSIM', 'Cash', 'Other'];

export const TASKS: Task[] = [
  { id: 'k-peak', title: 'Buy Peak Tram + Sky Terrace tickets and import them', group: 'Tickets', status: 'pending', due: '2026-12-06', critical: true, link: { label: 'Official site', url: LINKS.peak } },
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
  { id: 'em-hotel', label: 'Rambler Oasis Hotel', phone: '+852 2129 1888', status: 'confirmed' },
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
