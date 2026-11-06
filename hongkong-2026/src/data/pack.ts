// Starter packing inventory. Everything starts "Not Reviewed" — nothing is assumed owned, bought or spent.
// Stored edits live on top of this file (same safe overlay as the rest of the app), so nothing is overwritten.
import type { Bag, DayItem, FinalItem, FinalList, Inv, Person, ShopStatus } from '../lib/packTypes';

export const PACK_SEED_VERSION = 1;

export const BAGS: Bag[] = [
  { id: 'main', name: 'Main Checked', maxWeight: 20, actualWeight: null, order: 1, note: 'Cebu Pacific: one 20 kg checked bag (Gilbert), each international way. PAL domestic: no included checked bag — add-on still pending. Compression saves space, not weight. No power banks or spare lithium batteries in checked bags.' },
  { id: 'second', name: 'Optional Second Checked', maxWeight: null, actualWeight: null, order: 2, note: 'Starts empty. No extra allowance is assumed to be bought.' },
  { id: 'kcabin', name: 'Keren Carry-on', maxWeight: null, actualWeight: null, order: 3, note: 'Cabin limits differ by airline (PAL vs Cebu Pacific) — check both and follow the stricter one.' },
  { id: 'gcabin', name: 'Gilbert Carry-on', maxWeight: null, actualWeight: null, order: 4, note: 'Only if used. Stay within the airline’s combined cabin limit.' },
  { id: 'aya', name: 'Aya Backpack', maxWeight: null, actualWeight: null, order: 5, note: 'Gilbert carries it.' },
  { id: 'cross', name: 'Keren Crossbody', maxWeight: null, actualWeight: null, order: 6, note: 'Keep it compact.' },
  { id: 'stroller', name: 'Rented Stroller', maxWeight: null, actualWeight: null, order: 7, equipment: true, note: 'Equipment, not checked baggage. NOT with us when leaving Goa — collect from the rental at NAIA T3 on Dec 7. Contact the provider right after landing in Manila on Dec 11; hand it over after immigration, baggage and customs, before the T3 → T2 transfer.' },
];

type O = { p?: Person; q?: number; bag?: string | [string, number][]; opt?: boolean; shop?: ShopStatus; n?: string; task?: string; hi?: boolean; days?: number[]; worn?: boolean; listed?: boolean };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const used = new Set<string>();
function mk(cat: string, name: string, o: O = {}, group: 'general' | 'clothes' = 'general'): Inv {
  let id = (group === 'clothes' ? 'c-' : 'i-') + slug((o.p ?? '') + '-' + name);
  while (used.has(id)) id += '2';
  used.add(id);
  const q = o.q ?? 1;
  const bags: [string, number][] = o.bag ? (typeof o.bag === 'string' ? [[o.bag, q]] : o.bag) : [];
  return {
    id, name, notes: o.n, qty: q, cat, person: o.p ?? 'Shared', required: !o.opt, priority: o.hi ? 'high' : 'normal', group,
    shop: o.shop ?? 'Not Reviewed', currency: 'PHP', places: bags.map(([bag, qty]) => ({ bag, qty, packed: 0 })),
    days: o.days, worn: o.worn, taskId: o.task, shopListed: o.listed ?? group !== 'clothes',
  };
}
const G = (cat: string, items: [string, O?][]) => items.map(([n, o]) => mk(cat, n, o));

const LUGGAGE = G('Luggage & organizers', [
  ['Main checked suitcase'], ['Optional second suitcase', { opt: true }], ['Carry-on suitcase / backpack'],
  ['Gilbert’s backpack (carries Aya’s essentials)'], ['Keren’s zipped crossbody'],
  ['Packing cubes', { bag: 'main' }], ['Clothes compression bags', { bag: 'main' }], ['Clothing compressor', { opt: true }],
  ['Suitcase tags'], ['Luggage lock'], ['Luggage strap', { opt: true }], ['Compact luggage scale', { n: 'Use it at home — Cebu’s checked bag limit is 20 kg.' }],
  ['Toiletry bag', { bag: 'main' }], ['Medication pouch', { bag: 'kcabin' }], ['Document organizer', { bag: 'kcabin' }], ['Waterproof pouch', { bag: 'kcabin' }],
  ['Laundry bag', { bag: 'main' }], ['Zip bags', { bag: 'kcabin' }], ['Wet / soiled-clothes bags', { bag: 'aya' }], ['Foldable tote', { bag: 'kcabin' }],
]);
const TECH = G('Electronics & connectivity', [
  ['Samsung S22 (Hong Kong eSIM phone)', { p: 'Keren', bag: 'cross', shop: 'Purchased / Awaiting Delivery', n: 'eSIM purchased — setup still pending.' }],
  ['Gilbert’s phone', { p: 'Gilbert', bag: 'gcabin' }], ['Phone cases'], ['Chargers', { bag: 'kcabin' }], ['USB-C cables', { bag: 'kcabin' }], ['Spare cable', { bag: 'kcabin' }],
  ['USB charging plug', { bag: 'kcabin' }], ['Hong Kong UK Type G adapter', { bag: 'gcabin', n: 'Hong Kong uses 220 V, 3-pin Type G.' }],
  ['Power bank (clearly labeled, permitted capacity)', { bag: 'kcabin', hi: true, n: 'Cabin only — never in checked bags. Follow the airlines’ current power-bank rules.' }],
  ['Power-bank cable', { bag: 'kcabin' }], ['Earphones'], ['Secure wrist strap for phone', { opt: true }],
  ['Octopus card (physical)', { shop: 'Purchased / Awaiting Delivery', bag: 'cross', n: 'Purchased — not yet collected or activated.' }],
]);
const TOILET = G('Toiletries', [
  ['Adult toothbrushes (Keren, Gilbert)', { q: 2, bag: 'main' }], ['Aya’s age-appropriate toothbrush', { p: 'Aya', bag: 'main' }], ['Adult toothpaste', { bag: 'main' }], ['Aya’s toothpaste', { p: 'Aya', bag: 'main' }],
  ['Shampoo', { bag: 'main' }], ['Conditioner (if used)', { opt: true, bag: 'main' }], ['Soap / body wash', { bag: 'main' }], ['Cleanser (if used)', { opt: true }], ['Moisturizer / lotion', { bag: 'main' }],
  ['Lip balm', { bag: 'cross' }], ['Deodorant', { bag: 'main' }], ['Sunscreen', { bag: 'kcabin', n: 'Cabin liquids must be 100 mL or less per container, in one clear bag.' }],
  ['Hairbrush / comb', { bag: 'main' }], ['Hair ties / clips', { bag: 'main' }], ['Sanitary products (if needed)', { opt: true }], ['Tissues', { bag: 'cross' }], ['Wet wipes', { bag: 'kcabin' }],
  ['Hand sanitizer', { bag: 'cross' }], ['Small travel bottles', { bag: 'kcabin' }], ['Cabin liquids bag', { bag: 'kcabin' }], ['Nail-care supplies (if needed)', { opt: true }], ['Personal grooming items', { opt: true }],
]);
const AYA = G('Aya: hygiene, feeding & comfort', [
  ['Diapers / pull-ups (extra for travel days)', { p: 'Aya', bag: [['aya', 8], ['main', 14]], hi: true, n: 'More than normal on flight days. Edit the numbers any time.' }],
  ['Wipes', { p: 'Aya', bag: [['aya', 1], ['main', 2]] }], ['Portable changing mat', { p: 'Aya', bag: 'aya' }], ['Diaper cream (if used)', { p: 'Aya', opt: true, bag: 'aya' }], ['Disposal bags', { p: 'Aya', bag: 'aya' }],
  ['Child water bottle', { p: 'Aya', bag: 'aya' }], ['Toddler snacks', { p: 'Aya', bag: 'aya' }], ['Snack containers', { p: 'Aya', bag: 'aya' }], ['Utensils / bib (if used)', { p: 'Aya', opt: true, bag: 'aya' }],
  ['Milk / bottles (only if used)', { p: 'Aya', opt: true }], ['Small dinosaur toy', { p: 'Aya', bag: 'aya' }], ['Small books', { p: 'Aya', bag: 'aya' }], ['Quiet toys', { p: 'Aya', bag: 'aya' }],
  ['Sunhat', { p: 'Aya' }], ['Stroller organizer (only if safe)', { opt: true, bag: 'stroller' }],
]);
const OPTIN = G('Only if currently used', [
  ['Nursing cover', { p: 'Keren', opt: true }], ['Breast pump', { p: 'Keren', opt: true }], ['Milk storage bags', { p: 'Keren', opt: true }], ['Other breastfeeding supplies', { p: 'Keren', opt: true }], ['Swimwear (only if needed)', { opt: true }],
]);
const MEDS = G('Medicines & first aid', [
  ['Digital thermometer', { bag: 'aya' }], ['Regular prescriptions (each traveler, if any)', { bag: 'kcabin', n: 'Keep essential medicines in cabin luggage. Controlled drugs: check Hong Kong rules first.' }],
  ['Pediatrician-approved fever / pain medicine for Aya', { p: 'Aya', bag: 'aya', n: 'Review with Aya’s doctor. This app gives no doses or medical advice.' }],
  ['Parents’ familiar OTC medicines', { bag: 'kcabin' }], ['Oral rehydration salts', { bag: 'kcabin' }], ['Allergy medicine (only if needed / approved)', { opt: true }], ['Saline', { bag: 'kcabin' }],
  ['Motion-sickness supplies (if needed)', { opt: true }], ['Plasters', { bag: 'kcabin' }], ['Gauze', { bag: 'kcabin' }], ['Wound-cleaning wipes', { bag: 'kcabin' }], ['Antiseptic', { bag: 'kcabin' }],
  ['Measuring syringe', { bag: 'aya' }], ['Prescription copies', { bag: 'kcabin' }], ['Insurance emergency contact', { bag: 'kcabin', n: 'Insurance is not purchased yet — expected after Aya’s passport (about Nov 13).' }],
]);
const DOCS = G('Documents & travel prep', [
  ['Passports (3)', { bag: 'cross', hi: true }], ['Aya’s birth certificate copy', { p: 'Aya', bag: 'kcabin' }], ['Family / marriage record copy (if needed)', { opt: true }],
  ['PAL and Cebu Pacific itinerary receipts', { bag: 'kcabin' }], ['Boarding passes (when issued)', { bag: 'cross', n: 'Added later.' }], ['Hotel confirmation', { bag: 'kcabin' }],
  ['Disney tickets (2 adults)', { n: 'Original QR files stay in the Tickets tab.', task: 'k-disney' }], ['Ocean Park tickets (2 adults)', { n: 'Original QR files are in the Tickets tab.' }],
  ['Observation Wheel PDF (both adult QR codes in one file)', { n: 'Original file in the Tickets tab. Never edit it.' }], ['Peak Tram tickets', { n: 'Not bought yet.', task: 'k-peak', shop: 'Need to Buy' }],
  ['Travel insurance', { n: 'Not purchased yet — after Aya’s passport (about Nov 13).' }], ['Departure / return eTravel', { n: 'Verify the current requirement for your dates.' }],
  ['Aya’s travel-tax proof', { p: 'Aya', task: 'k-travel-tax' }], ['PAL checked-baggage add-on', { task: 'k-palbag', shop: 'Need to Buy', n: 'Pending. Do not assume extra allowance.' }],
  ['Stroller-rental pickup / return contact', { task: 'k-stroller', bag: 'stroller' }], ['Wise card', { bag: 'cross' }], ['HKD cash', { bag: 'cross' }], ['Octopus receipt', { bag: 'kcabin' }],
  ['eSIM activation instructions', { task: 'k-esim' }], ['Emergency contact card', { bag: 'cross' }], ['Important offline copies', { task: 'k-import' }],
]);
const STROLLER = G('Stroller', [['Rented stroller (collect at NAIA T3, Dec 7)', { bag: 'stroller', n: 'Not with us when leaving Goa.' }], ['Stroller rain cover', { p: 'Aya', bag: 'stroller' }]]);

// ---- Clothes ----
const C = (p: Person, name: string, o: O = {}) => mk('Clothes — ' + p, name, { p, ...o }, 'clothes');
const outfit = (p: Person, d: number, label: string, o: O = {}) => C(p, `Dec ${6 + d}: ${label}`, { days: [d], bag: 'main', ...o });
const CLOTHES: Inv[] = [
  C('Keren', 'Dec 7: comfortable airport / travel outfit (worn)', { days: [1], worn: true, n: 'Modest: below-knee / midi / maxi skirt or dress, relaxed fit. Warm neutrals — maroon, brown, taupe.' }),
  outfit('Keren', 2, 'Peak Tram / Ocean Park'), outfit('Keren', 3, 'Museum / Disney Day 1'), outfit('Keren', 4, 'Disneyland / PhotoPass'), outfit('Keren', 5, 'return-flight outfit'),
  C('Keren', 'Spare outfit (optional)', { opt: true, bag: 'kcabin' }), C('Keren', 'Sleepwear sets', { q: 2, bag: 'main' }), C('Keren', 'Underwear', { q: 7, bag: [['main', 5], ['kcabin', 2]] }), C('Keren', 'Socks', { q: 6, bag: 'main' }),
  C('Keren', 'Cardigan / jacket', { bag: 'kcabin' }), C('Keren', 'Layering top (optional)', { opt: true, bag: 'main' }), C('Keren', 'Comfortable walking shoes (worn)', { worn: true, n: 'One comfortable pair.' }),
  C('Keren', 'Hair accessories', { bag: 'main' }), C('Keren', 'Extra footwear (only if needed)', { opt: true }),
  C('Gilbert', 'Dec 7: travel outfit (worn)', { days: [1], worn: true }), outfit('Gilbert', 2, 'Peak Tram / Ocean Park'), outfit('Gilbert', 3, 'Museum / Disney Day 1'), outfit('Gilbert', 4, 'Disneyland / PhotoPass'), outfit('Gilbert', 5, 'return-flight outfit'),
  C('Gilbert', 'Extra shirt', { bag: 'gcabin' }), C('Gilbert', 'Comfortable bottoms (re-wear planned)', { q: 3, bag: 'main' }), C('Gilbert', 'Sleepwear', { q: 2, bag: 'main' }), C('Gilbert', 'Underwear', { q: 7, bag: [['main', 5], ['gcabin', 2]] }),
  C('Gilbert', 'Socks', { q: 6, bag: 'main' }), C('Gilbert', 'Jacket / hoodie', { bag: 'main' }), C('Gilbert', 'Light layer (optional)', { opt: true, bag: 'main' }), C('Gilbert', 'Comfortable walking shoes (worn)', { worn: true }), C('Gilbert', 'Cap (optional)', { opt: true }),
  C('Aya', 'Dec 7: travel outfit (worn)', { days: [1], worn: true, n: 'Easy for diaper changes.' }), outfit('Aya', 2, 'Peak Tram / Ocean Park'), outfit('Aya', 3, 'Museum / Disney Day 1'), outfit('Aya', 4, 'Disneyland / PhotoPass'), outfit('Aya', 5, 'return-flight outfit'),
  C('Aya', 'Spare outfits', { q: 4, bag: [['aya', 2], ['main', 2]], hi: true, n: 'At least two always reachable on flight days.' }), C('Aya', 'Sleepwear sets', { q: 3, bag: 'main' }), C('Aya', 'Socks', { q: 8, bag: [['aya', 3], ['main', 5]] }),
  C('Aya', 'Jackets / cardigans', { q: 2, bag: [['aya', 1], ['main', 1]] }), C('Aya', 'Light layer', { bag: 'main' }), C('Aya', 'Comfortable shoes (worn)', { worn: true }), C('Aya', 'Spare footwear (optional)', { opt: true }),
  C('Aya', 'Hat', { bag: 'aya' }), C('Aya', 'Hair accessories', { bag: 'main' }), mk('Clothes — Aya', 'Disney dress / outfit (optional, if owned or intentionally bought)', { p: 'Aya', opt: true, days: [4], listed: true, bag: 'main' }, 'clothes'),
];
export const INV: Inv[] = [...LUGGAGE, ...TECH, ...TOILET, ...AYA, ...OPTIN, ...MEDS, ...DOCS, ...STROLLER, ...CLOTHES];

// ---- Daily bags (each day has its own check state) ----
const D = (day: number, section: string, labels: string[]): DayItem[] => labels.map((label) => ({ id: `d${day}-${slug(section + '-' + label)}`, day, section, label }));
const ayaDay = (day: number, outfits: string, extra: string[] = []) => D(day, 'Aya’s bag', ['Diapers (extra on travel days)', 'Wipes', 'Changing mat', 'Disposal bags', outfits, 'Socks', 'Jacket', 'Snacks & drink', 'Dinosaur toy / quiet toys', 'Wet bag', 'Needed medicines', ...extra]);
const baseTech = (day: number) => D(day, 'Everyday', ['Phones', 'Chargers', 'Power bank (cabin)', 'Wise card / HKD cash', 'Hand sanitizer & tissues', 'Water & snacks', 'Jackets / layers']);
export const DAYBAG: DayItem[] = [
  ...D(1, 'Documents', ['Passports (3)', 'Flight itineraries (domestic + international)', 'Departure eTravel', 'Aya’s travel-tax proof / payment plan', 'Hotel confirmation', 'Insurance (if obtained)', 'Wise / cards / cash', 'Emergency contacts', 'Stroller-rental pickup details']),
  ...D(1, 'Tech & essentials', ['Phones', 'Chargers', 'Power bank (in cabin bag)', 'Adapters', 'Light layers', 'Snacks', 'Refillable water bottles (empty at liquids screening)', 'Hand sanitizer', 'Tissues', 'Essential medicines', 'Backup booking files']),
  ...ayaDay(1, '2–3 spare outfits', ['More diapers than usual']),
  ...D(1, 'Departure checks', ['Suitcase and cabin bags weighed to airline limits', 'Valuables easy to reach', 'Power bank NOT in checked bag', 'Stroller will be collected at NAIA T3 — not packed from home']),
  ...D(2, 'Tickets & documents', ['Peak Tram tickets (if bought)', 'Ocean Park — 2 original adult QR tickets', 'Observation Wheel — one PDF with both adult QR codes']),
  ...baseTech(2), ...D(2, 'Everyday', ['Octopus (after collection)', 'Stroller + rain cover', 'Sunscreen']),
  ...ayaDay(2, '2 spare outfits'),
  ...D(2, 'Reminders', ['Fold the stroller when required', 'Check Ocean Park opening times', 'Wheel: stroller storage + fee on site', 'Optional ferry / night bus — not counted as paid']),
  ...D(3, 'Tickets & documents', ['Disneyland — original adult QR images / Google Wallet', 'Science Museum floor map (official)']),
  ...baseTech(3), ...D(3, 'Everyday', ['Octopus', 'Stroller + rain cover if needed']), ...ayaDay(3, '2 spare outfits'),
  ...D(3, 'Optional night market', ['Extra HKD cash', 'Evening layer']),
  ...D(4, 'Tickets & documents', ['Disney tickets / Wallet (adults)', 'Official PhotoPass details']),
  ...baseTech(4), ...D(4, 'Everyday', ['Photo outfits chosen (Keren, Gilbert, Aya)', 'Hair accessories', 'Phone storage free', 'Stroller + rain cover as needed', 'Evening jackets', 'Wipes & sanitizer']),
  ...ayaDay(4, '2 spare outfits', ['Optional approved hearing protection for the loud show']),
  ...D(4, 'Reminders', ['No private photographer, selfie stick or tripod', 'Pre-pack most return luggage before leaving the hotel', 'After Momentous: straight to Rambler Oasis and finish packing']),
  ...D(5, 'Documents', ['Passports (3)', 'Boarding passes — both airlines', 'Return eTravel', 'Insurance', 'Wise / HKD / Octopus']),
  ...D(5, 'Everyday', ['Phones, cables, power bank (cabin)', 'Medicines', 'Jackets', 'Travel snacks & drink']), ...ayaDay(5, '2–3 spare outfits', ['Extra travel-day diapers']),
  ...D(5, 'Stroller return', ['Contact the rental provider after landing in Manila', 'Hand over AFTER immigration, baggage and customs — before T3 → T2 transfer', 'Leave enough time for the separate PAL flight']),
];

const F = (list: FinalList, section: string, labels: string[]): FinalItem[] => labels.map((label) => ({ id: `f-${list}-${slug(section + '-' + label)}`, list, section, label }));
export const FINALS: FinalItem[] = [
  ...F('leave', 'People', ['Keren ready', 'Gilbert ready', 'Aya ready', 'Travel clothes worn', 'Snacks within reach', 'Aya’s bag ready']),
  ...F('leave', 'Documents', ['Passports (3)', 'Bookings', 'Departure eTravel', 'Travel-tax proof / plan', 'Hotel booking', 'Insurance (if issued)', 'Emergency info', 'Wise / cash']),
  ...F('leave', 'Bags', ['Checked suitcase packed & weighed', 'PAL baggage add-on confirmed', 'Cabin bags packed & weighed', 'Aya backpack', 'Keren crossbody', 'Tags on bags', 'Essential medication in cabin', 'Power bank in cabin', 'Original tickets saved']),
  ...F('leave', 'Electronics', ['Phones & power bank charged', 'Cables', 'Type G plug', 'eSIM instructions saved', 'Offline maps saved', 'Offline tickets tested', 'Disney passes in Google Wallet', 'Dashboard backup made']),
  ...F('leave', 'House', ['Gas / stove off', 'Unneeded appliances unplugged', 'Water taps off', 'Windows & doors locked', 'Trash out', 'Fridge perishables handled', 'Keys', 'House arrangements done']),
  ...F('leave', 'Leave', ['Driver / vehicle ready', 'Road conditions checked', 'Luggage loaded', 'All three of us together', 'Depart home around 12:30 AM']),
  ...F('night', 'Tonight', ['Weather checked', 'Opening hours checked', 'Tickets ready', 'Route checked', 'Family outfits chosen', 'Diapers, wipes, snacks & water topped up', 'Phones & power bank charging', 'Cash / cards ready', 'Stroller ready', 'Tomorrow’s bag packed', 'Alarms set']),
  ...F('morning', 'Before we leave', ['Phone', 'Wise / card / cash', 'Octopus', 'Today’s tickets', 'Power bank', 'Stroller / rain cover (if needed)', 'Diapers, wipes, changing mat', 'Aya’s spare clothes', 'Water & snacks', 'Jackets', 'Medications', 'Hotel room key', 'Lock the door', 'Directions ready']),
  ...F('checkout', 'Bedroom', ['Under beds & pillows', 'Side tables', 'Drawers', 'Wardrobe', 'Chair / desk', 'Curtain area', 'Luggage spots']),
  ...F('checkout', 'Bathroom', ['Toothbrushes', 'Toothpaste', 'Toiletries', 'Medicines', 'Shower / sink', 'Shelves', 'Hooks', 'Aya’s supplies', 'Wet clothes']),
  ...F('checkout', 'Electronics', ['Phones', 'Cables', 'Adapters', 'Chargers', 'Power bank', 'All sockets checked']),
  ...F('checkout', 'Clothes', ['Clean / dirty sorted', 'Laundry bag', 'Socks', 'Sleepwear', 'Outer layers', 'Aya extras', 'Packing cubes']),
  ...F('checkout', 'Aya', ['Diapers, wipes, mat', 'Toys & books', 'Snacks & drinks', 'Medicine', 'Stroller accessories']),
  ...F('checkout', 'Documents', ['Passports (3)', 'Boarding passes — both airlines', 'Return eTravel', 'Cash / Wise / Octopus', 'Insurance', 'Stroller return contact']),
  ...F('checkout', 'Hotel & ride', ['Room safe checked', 'Local taxes / outstanding charges', 'Deposit refund process', 'Key returned', 'Checkout confirmed', 'Uber child-seat pickup', 'HKIA check-in terminal known', 'All luggage counted']),
  ...F('home', 'Back home', ['Count all bags', 'Sort laundry', 'Unpack medicines & toiletries', 'Store chargers & passports', 'Back up family photos', 'Download PhotoPass images (if purchased)', 'Confirm stroller returned', 'Watch for hotel deposit refund', 'Enter remaining expenses', 'Compare final cost with the ₱150,000 cap', 'Export trip data']),
];
export const DEFAULT_CATS = ['Luggage & organizers', 'Electronics & connectivity', 'Toiletries', 'Aya: hygiene, feeding & comfort', 'Medicines & first aid', 'Documents & travel prep', 'Stroller', 'Only if currently used'];
