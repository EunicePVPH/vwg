export type ShopStatus = 'Not Reviewed' | 'Already Have' | 'Need to Buy' | 'Ordered' | 'Purchased / Awaiting Delivery' | 'Received' | 'Not Needed';
export const SHOP_STATUSES: ShopStatus[] = ['Not Reviewed', 'Already Have', 'Need to Buy', 'Ordered', 'Purchased / Awaiting Delivery', 'Received', 'Not Needed'];
export type Person = 'Keren' | 'Gilbert' | 'Aya' | 'Shared';
export const PEOPLE: Person[] = ['Keren', 'Gilbert', 'Aya', 'Shared'];

export interface Place { bag: string; qty: number; packed: number }
export interface Inv {
  id: string; name: string; notes?: string;
  qty: number; cat: string; person: Person; required: boolean; priority: 'high' | 'normal' | 'low';
  group: 'general' | 'clothes';
  shop: ShopStatus; estCost?: number | null; actualCost?: number | null; currency: 'PHP' | 'HKD';
  purchaseDate?: string; source?: string; receipt?: string; expenseId?: string;
  places: Place[];
  worn?: boolean; days?: number[]; notNeeded?: boolean; shopListed?: boolean; taskId?: string;
}
export interface DayItem { id: string; day: number; section: string; label: string; notes?: string; notNeeded?: boolean }
export type FinalList = 'leave' | 'night' | 'morning' | 'checkout' | 'home';
export interface FinalItem { id: string; list: FinalList; section: string; label: string; notNeeded?: boolean }
export interface Bag { id: string; name: string; maxWeight?: number | null; actualWeight?: number | null; order: number; equipment?: boolean; note?: string }

export interface PackUI {
  tab: 'shop' | 'clothes' | 'bags' | 'days' | 'final';
  shopFilter: 'all' | 'need' | 'have' | 'ordered' | 'nn';
  cat: string;
  person: 'Keren' | 'Gilbert' | 'Aya';
  clothesFilter: 'all' | 'day' | 'unpacked' | 'packed';
  bag: string; day: number; fList: FinalList; fDay: number;
  showPacked: boolean; hideNN: boolean; missingOnly: boolean;
  open: Record<string, boolean>;
  extraCats?: string[]; hiddenCats?: string[];
}
export const DEFAULT_UI: PackUI = {
  tab: 'shop', shopFilter: 'all', cat: 'all', person: 'Keren', clothesFilter: 'all', bag: 'main', day: 1, fList: 'leave', fDay: 2,
  showPacked: true, hideNN: true, missingOnly: false, open: {},
};
