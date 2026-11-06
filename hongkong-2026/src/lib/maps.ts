// Google Maps deep links (documented URL scheme). No coordinates are invented:
// we pass the place name / address as text and let Maps resolve it.
const enc = encodeURIComponent;
export const mapSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${enc(q)}`;
export const mapDir = (dest: string, mode: 'transit' | 'driving' | 'walking' = 'transit') =>
  `https://www.google.com/maps/dir/?api=1&destination=${enc(dest)}&travelmode=${mode}`;
export const mapNearby = (what: string) => `https://www.google.com/maps/search/${enc(what)}+near+me`;
export const tel = (n: string) => 'tel:' + n.replace(/[^+\d]/g, '');
