// Key addresses — ONLY places named in your plan. Show these to a taxi driver or paste into Maps. No address here is invented;
// where the plan gave only a general area, the line says so.
export interface Addr { id: string; name: string; zh?: string; addr: string; note?: string }
export const KEY_ADDRESSES: Addr[] = [
  { id: 'hotel', name: 'Rambler Oasis Hotel', addr: 'Rambler Oasis Hotel, 1 Tsing Yi Road, Tsing Yi, Hong Kong', note: 'Chinese address: add it in the hotel record once confirmed.' },
  { id: 'hkia', name: 'Hong Kong International Airport (arrival Dec 7)', addr: 'Hong Kong International Airport, Chek Lap Kok, Hong Kong' },
  { id: 'hkia-t2', name: 'HKIA Terminal 2 — Cebu Pacific check-in (Dec 11)', zh: '第二客運大樓', addr: 'Hong Kong International Airport Terminal 2, Chek Lap Kok, Hong Kong', note: 'Aisle R per Cebu Pacific as of June 9, 2026 — VERIFY on the day.' },
  { id: 'peak', name: 'Peak Tram Lower Terminus', zh: '山頂纜車總站', addr: '33 Garden Road, Central, Hong Kong' },
  { id: 'ocean', name: 'Ocean Park Hong Kong', zh: '香港海洋公園', addr: '180 Wong Chuk Hang Road, Aberdeen, Hong Kong' },
  { id: 'statue', name: 'Statue Square', zh: '皇后像廣場', addr: 'Statue Square, Central, Hong Kong' },
  { id: 'wheel', name: 'Hong Kong Observation Wheel', addr: '33 Man Kwong Street, Central, Hong Kong' },
  { id: 'pier7', name: 'Star Ferry — Central Pier 7', zh: '天星小輪 中環7號碼頭', addr: 'Central Pier 7, Man Kwong Street, Central, Hong Kong' },
  { id: 'tst-ferry', name: 'Star Ferry — Tsim Sha Tsui', zh: '天星小輪 尖沙咀', addr: '10 Salisbury Road, Tsim Sha Tsui, Hong Kong' },
  { id: 'avenue', name: 'Avenue of Stars (Waterfront Promenade)', zh: '星光大道', addr: 'Tsim Sha Tsui Waterfront Promenade, Salisbury Road, Tsim Sha Tsui, Hong Kong' },
  { id: 'science', name: 'Hong Kong Science Museum', zh: '香港科學館', addr: '2 Science Museum Road, Tsim Sha Tsui East, Kowloon, Hong Kong' },
  { id: 'fairwood', name: 'Fairwood (alternative lunch)', addr: '1/F, New Mandarin Plaza, 14 Science Museum Road, Tsim Sha Tsui East, Hong Kong' },
  { id: 'disney', name: 'Hong Kong Disneyland Resort', zh: '香港迪士尼樂園', addr: 'Hong Kong Disneyland Resort, Lantau Island, Hong Kong' },
  { id: 'temple', name: 'Temple Street Night Market (Jordan Road end)', zh: '廟街夜市', addr: 'Temple Street at Jordan Road, Jordan, Kowloon, Hong Kong' },
];
