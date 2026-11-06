export type Status = 'confirmed' | 'paid' | 'estimated' | 'pending' | 'optional' | 'verify';
export type Currency = 'HKD' | 'PHP' | 'USD';
export type Mode = 'walk' | 'uber' | 'mtr' | 'ferry' | 'bus' | 'plane' | 'tram' | 'car' | 'cable';
export type Kind = 'travel' | 'flight' | 'meal' | 'sight' | 'rest' | 'hotel' | 'task' | 'show';
export type Priority = 'must' | 'normal' | 'optional';

export interface Day {
  id: number;
  date: string; // YYYY-MM-DD
  weekday: string;
  title: string;
  subtitle: string;
  route: string[]; // schematic stops
  routeModes: Mode[];
  photoKey: string;
  accent: 'sky' | 'coral' | 'turq' | 'lav' | 'sun';
  summaryNote: string;
}

export interface Activity {
  id: string;
  day: number;
  start: string; // HH:mm  (UTC+8)
  end?: string;
  title: string;
  kind: Kind;
  priority: Priority;
  status: Status;
  mode?: Mode;
  place?: string; // text for map search
  notes?: string;
  tips?: string[];
  stroller?: string;
  restroom?: string;
  nap?: boolean;
  costHKD?: number | null;
  cat?: string;
  ticketId?: string;
  flightId?: string;
  link?: { label: string; url: string };
  alt?: string; // transport alternative
}

export interface Ticket {
  id: string;
  name: string;
  photoKey: string;
  dayId: number;
  date: string;
  type: string;
  guests: { label: string; note?: string }[];
  status: Status;
  statusLabel?: string;
  notes?: string;
  restrictions?: string[];
  bookingUrl?: string;
  bookingLabel?: string;
  mapUrl?: string;
  mapLabel?: string;
  place?: string;
}

export interface Flight {
  id: string;
  airline: string;
  code: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  date: string;
  dep: string;
  arr: string;
  depTerminal?: string;
  arrTerminal?: string;
  seats: { who: string; seat: string }[];
  baggage: string;
  carryOn: string;
  status: Status;
  notes?: string;
  bookingUrl?: string;
}

export interface Hotel {
  id: string;
  name: string;
  address: string;
  addressZh: string; // empty until verified
  phone: string;
  checkIn: string;
  checkOut: string;
  room: string;
  guests: string;
  nights: number;
  bookedVia: string;
  totalUSD: number;
  paidUSD: number;
  localTaxHKD: number;
  depositHKD: number;
  depositStatus: 'unknown' | 'paid-cash' | 'paid-card' | 'refunded';
  paymentMethod: string;
  upgradeNote: string;
  shuttleNote: string;
  notes: string;
}

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number | null; // null = price not yet known
  currency: Currency;
  status: 'paid' | 'estimated' | 'actual' | 'optional';
  kind: 'spend' | 'deposit' | 'cash';
  day?: number;
  note?: string;
}

export interface Task {
  id: string;
  title: string;
  group: string;
  status: Status;
  due?: string;
  note?: string;
  critical?: boolean;
  link?: { label: string; url: string };
}

export interface PackItem { id: string; label: string; group: string; owner?: string; note?: string }

export interface Restaurant {
  id: string;
  name: string;
  area: string;
  kind: string;
  status: Status;
  query: string;
  note?: string;
  dayId?: number;
}

export interface HealthItem { id: string; kind: 'medicine' | 'allergy' | 'contact' | 'note'; label: string; value: string }
export interface EmergencyItem { id: string; label: string; phone?: string; note?: string; status: Status; urgent?: boolean }

export interface DocMeta {
  name: string;
  mime: string;
  folder: string;
  size: number;
  sha256: string;
  addedAt: number;
  ticketId?: string;
  flightId?: string;
  slot?: string;
  note?: string;
}
export interface DocRecord extends DocMeta { id: string }

export interface ShoppingItem { id: string; label: string; who: string; price: number | null; currency: Currency; note?: string }
