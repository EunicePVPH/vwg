import { ShoppingBag, Backpack, BookOpen, ClipboardCheck, FolderOpen, HeartPulse, Plane, Receipt, Settings as SettingsIcon, Siren, Utensils, Lock } from 'lucide-react';
import { Card, PageHeader } from '../ui/primitives';
import { go } from '../ui/router';

const ITEMS = [
  { to: 'more/flights', icon: <Plane />, title: 'Flights & Hotel', sub: 'Seats, baggage, check-in', tone: 'bg-sky-soft text-[#1d5f99]' },
  { to: 'more/expenses', icon: <Receipt />, title: 'Expenses', sub: 'HKD + PHP, paid vs planned', tone: 'bg-lav-soft text-[#5046b4]' },
  { to: 'more/ready', icon: <ClipboardCheck />, title: 'Travel Ready', sub: 'Tasks before we go', tone: 'bg-sun-soft text-[#8a5f00]' },
  { to: 'more/packing', icon: <Backpack />, title: 'Packing', sub: 'Check it off', tone: 'bg-turq-soft text-[#0b6b61]' },
  { to: 'more/shopping', icon: <ShoppingBag />, title: 'Shopping list', sub: 'To buy in Hong Kong', tone: 'bg-pink-soft text-[#a1305a]' },
  { to: 'more/documents', icon: <FolderOpen />, title: 'Phone Documents', sub: 'Private encrypted wallet', tone: 'bg-coral-soft text-[#a63a2b]' },
  { to: 'more/food', icon: <Utensils />, title: 'Food Finder', sub: 'Meals near each stop', tone: 'bg-pink-soft text-[#a1305a]' },
  { to: 'more/guide', icon: <BookOpen />, title: 'Hong Kong Guide', sub: 'Weather, tips, plugs', tone: 'bg-sky-soft text-[#1d5f99]' },
  { to: 'more/health', icon: <HeartPulse />, title: 'Health & Medicines', sub: 'Aya’s info', tone: 'bg-coral-soft text-[#a63a2b]' },
  { to: 'more/emergency', icon: <Siren />, title: 'Emergency', sub: '999 and key numbers', tone: 'bg-coral-soft text-[#a63a2b]' },
  { to: 'more/settings', icon: <SettingsIcon />, title: 'Settings & Backup', sub: 'PIN, backup, rates', tone: 'bg-lav-soft text-[#5046b4]' },
];
export function More({ onLock }: { onLock: () => void }) {
  return (
    <div className="pb-4">
      <PageHeader title="More" right={<button onClick={onLock} className="tap flex items-center gap-1.5 rounded-2xl bg-navy px-3 text-[14px] font-bold text-white"><Lock size={16} />Lock</button>} />
      <div className="grid grid-cols-2 gap-3">
        {ITEMS.map((it) => (
          <Card key={it.to} onClick={() => go(it.to)} className="p-4">
            <div className={`mb-3 grid h-12 w-12 place-items-center rounded-2xl ${it.tone}`}>{it.icon}</div>
            <div className="text-[16px] font-bold leading-tight text-navy">{it.title}</div><div className="text-[13px] text-muted">{it.sub}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
