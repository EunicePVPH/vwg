import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, ShoppingBag, Receipt } from 'lucide-react';
import { EXPENSES, SHOPPING, SHOP_WHO } from '../data/seed';
import { useAppState, useChecks, useCollection } from '../state/store';
import { currentDayId, tripPhase } from '../lib/time';
import { fmtBoth, fmtNative, toHKD } from '../lib/money';
import { Btn, Card, Empty, PageHeader, SectionTitle, cx } from '../ui/primitives';
import { EditSheet, type Field } from '../ui/EditSheet';
import type { Currency, Expense, ShoppingItem } from '../types';

const FIELDS: Field[] = [
  { key: 'label', label: 'What to buy', type: 'text' },
  { key: 'when', label: 'When', type: 'select', options: [{ value: 'before', label: 'Before the trip (at home)' }, { value: 'hk', label: 'In Hong Kong' }] },
  { key: 'who', label: 'For who', type: 'select', options: SHOP_WHO.map((w) => ({ value: w, label: w })) },
  { key: 'price', label: 'Planned price (optional)', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'HKD', label: 'HK$ (HKD)' }, { value: 'PHP', label: '₱ (PHP)' }, { value: 'USD', label: 'US$ (USD)' }] },
  { key: 'note', label: 'Note (store, size, brand…)', type: 'text' },
];

export function Shopping() {
  const { items, add, update, remove } = useCollection<ShoppingItem>('shopping', SHOPPING);
  const exps = useCollection<Expense>('expenses', EXPENSES);
  const { checks, toggle, set } = useChecks();
  const { state } = useAppState(); const r = state.settings.rates;
  const [edit, setEdit] = useState<ShoppingItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<'all' | 'before' | 'hk'>('all');
  const shown = items.filter((i) => tab === 'all' || (i.when ?? 'hk') === tab);
  const bought = shown.filter((i) => checks['shop:' + i.id]);
  const todo = shown.filter((i) => !checks['shop:' + i.id]);
  const planned = todo.reduce((n, i) => n + (i.price ? toHKD(i.price, i.currency, r) : 0), 0);

  const logExpense = (i: ShoppingItem) => {
    exps.add({ id: 'u-' + Date.now().toString(36), label: 'Shopping: ' + i.label, amount: i.price, currency: i.currency, category: 'Shopping', status: (i.when ?? 'hk') === 'before' ? 'paid' : 'actual', kind: 'spend', day: (i.when ?? 'hk') === 'before' ? undefined : currentDayId() ?? undefined, note: i.who });
    set('shoplog:' + i.id, true);
  };

  const Row = ({ i }: { i: ShoppingItem }) => {
    const done = !!checks['shop:' + i.id]; const logged = !!checks['shoplog:' + i.id];
    return (
      <div className="px-4 py-3">
        <div className="flex items-start gap-3">
          <input type="checkbox" aria-label={'Bought ' + i.label} className="mt-1 h-6 w-6 shrink-0 accent-[#14b8a6]" checked={done} onChange={() => toggle('shop:' + i.id)} />
          <div className="min-w-0 flex-1">
            <div className={cx('text-[15px] font-bold leading-snug text-navy', done && 'text-muted line-through')}>{i.label}</div>
            <div className="text-[12px] text-muted">{(i.when ?? 'hk') === 'before' ? 'Before the trip' : 'In Hong Kong'} · {i.who}{i.note ? ' · ' + i.note : ''}</div>
            {done && i.price && !logged && <button onClick={() => logExpense(i)} className="tap mt-2 inline-flex items-center gap-1.5 rounded-xl bg-turq-soft px-3 text-[13px] font-bold text-[#0b6b61]"><Receipt size={15} />Add to my expenses</button>}
            {done && logged && <div className="mt-1 text-[12px] font-bold text-[#0b6b61]">✓ Added to expenses</div>}
          </div>
          <div className="text-right text-[14px] font-bold text-navy">{i.price ? fmtNative(i.price, i.currency) : <span className="text-[12px] font-normal text-muted">no price</span>}</div>
          <button onClick={() => setEdit(i)} aria-label="Edit" className="tap grid place-items-center text-muted"><Pencil size={17} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-4">
      <PageHeader title="Shopping list" back="more" sub="Before the trip & in Hong Kong" right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />
      <div className="mb-3 flex gap-2">{([['all', 'All'], ['before', 'Before the trip'], ['hk', 'In Hong Kong']] as const).map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cx('tap flex-1 rounded-2xl px-2 text-[13px] font-bold', tab === k ? 'bg-navy text-white' : 'bg-white text-navy shadow-sm')}>{l}</button>)}</div>
      <Card className="mb-3 flex items-center justify-between p-4"><div><div className="text-[12px] font-bold uppercase text-muted">Still to buy</div><div className="text-[13px] text-muted">{todo.length} item{todo.length === 1 ? '' : 's'} · counted in your planned budget</div></div><div className="text-right font-display text-[20px] font-bold text-navy">{fmtBoth(planned, r)}</div></Card>
      {shown.length === 0 && <Empty icon={<ShoppingBag size={36} />} title="Nothing here yet">Tap Add — for example things you’re buying now for the trip, diapers top-up, snacks, souvenirs, pasalubong.</Empty>}
      {todo.length > 0 && <Card className="divide-y divide-navy/5 overflow-hidden">{todo.map((i) => <Row key={i.id} i={i} />)}</Card>}
      {bought.length > 0 && (<><SectionTitle>Bought ✓</SectionTitle><Card className="divide-y divide-navy/5 overflow-hidden"><motion.div layout>{bought.map((i) => <Row key={i.id} i={i} />)}</motion.div></Card></>)}
      <p className="mt-3 px-1 text-[13px] text-muted">Tip: tick an item when you buy it, then tap <b>Add to my expenses</b>. Items bought before the trip go to “Spent so far” as paid; Hong Kong purchases go to that trip day.</p>
      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit item" fields={FIELDS} values={edit ? { label: edit.label, when: edit.when ?? 'hk', who: edit.who, price: edit.price, currency: edit.currency, note: edit.note ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { label: String(v.label || edit.label), when: (v.when as 'before' | 'hk') || 'hk', who: String(v.who), price: v.price as number | null, currency: v.currency as Currency, note: String(v.note ?? '') })} onDelete={edit ? () => remove(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Add to shopping list" saveLabel="Add" fields={FIELDS} values={{ label: '', when: tripPhase() === 'before' ? 'before' : 'hk', who: 'Family', price: '', currency: 'HKD', note: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), label: String(v.label || 'Item'), when: (v.when as 'before' | 'hk') || 'hk', who: String(v.who || 'Family'), price: v.price as number | null, currency: (v.currency as Currency) || 'HKD', note: String(v.note ?? '') })} />
    </div>
  );
}
