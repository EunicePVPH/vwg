import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, PiggyBank, Pencil, Plus, RefreshCw } from 'lucide-react';
import { ACTIVITIES, DAYS, EXPENSES, EXPENSE_CATEGORIES, SHOPPING } from '../data/seed';
import { useAppState, useChecks, useCollection, useSettings } from '../state/store';
import { CATEGORIES, catOf, dayEstimate, normCat } from '../lib/trip';
import { computeBudget } from '../lib/budget';
import { currentDayId } from '../lib/time';
import { fetchRates, fmtBoth, fmtHKD, fmtNative, fmtPHP, fmtPHP2, hkdToPhp, toHKD, usdToPhp, DEFAULT_RATES } from '../lib/money';
import { Btn, Card, PageHeader, SectionTitle, StatusPill, cx } from '../ui/primitives';
import { EditSheet, type Field } from '../ui/EditSheet';
import type { Activity, Currency, Expense } from '../types';

const COLORS: Record<string, string> = { Flights: '#3aa8f5', Hotel: '#8f84ee', Food: '#ff6b57', Transport: '#14b8a6', 'Activities & Attractions': '#ffc83d', Shopping: '#12284c', Essentials: '#5fd3c5', OOTD: '#c084fc', Other: '#94a3b8' };

const FIELDS: Field[] = [
  { key: 'label', label: 'What was it for?', type: 'text' },
  { key: 'amount', label: 'Amount (leave empty if not known yet)', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'HKD', label: 'HK$ (HKD)' }, { value: 'PHP', label: '₱ (PHP)' }] },
  { key: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'actual', label: 'Spent during the trip (counts in “Spent”)' }, { value: 'estimated', label: 'Planned — not paid yet' }, { value: 'optional', label: 'Optional — only if we want' }, { value: 'paid', label: 'Paid before the trip' }] },
  { key: 'kind', label: 'Type', type: 'select', options: [{ value: 'spend', label: 'Spending' }, { value: 'deposit', label: 'Deposit (refundable, not spending)' }, { value: 'cash', label: 'Cash withdrawal (not spending)' }] },
  { key: 'day', label: 'Trip day (1–5, optional)', type: 'number' },
  { key: 'note', label: 'Note', type: 'text' },
];

export function Money() {
  const { items: exps, update, add, remove, restore, isEdited, isSeed } = useCollection<Expense>('expenses', EXPENSES);
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const shop = useCollection('shopping', SHOPPING).items; const { checks } = useChecks();
  const { state } = useAppState(); const { setSettings } = useSettings(); const r = state.settings.rates;
  const [edit, setEdit] = useState<Expense | null>(null);
  const [adding, setAdding] = useState(false);
  const [rateEdit, setRateEdit] = useState(false);
  const [capEdit, setCapEdit] = useState(false);
  const [fetching, setFetching] = useState(false);

  const hk = (e: Expense) => (e.amount ? toHKD(e.amount, e.currency, r) : 0);
  const { prepaid, actual, paidTotal, remaining, optionalTotal, everything } = computeBudget(acts, exps, shop, checks, r);
  const paidBreakdown = (() => {
    const m = new Map<string, { cur: Set<string>; native: number; hkd: number }>();
    for (const e of exps) if (e.kind === 'spend' && e.amount && (e.status === 'paid' || e.status === 'actual')) { const x = m.get(normCat(e.category)) ?? { cur: new Set<string>(), native: 0, hkd: 0 }; x.cur.add(e.currency === 'USD' ? 'PHP' : e.currency); x.native += e.currency === 'USD' ? usdToPhp(e.amount, r) : e.amount; x.hkd += hk(e); m.set(normCat(e.category), x); }
    return [...m.entries()].map(([c, x]) => `${c} ${x.cur.size === 1 ? fmtNative(x.native, [...x.cur][0] as Currency) : fmtHKD(x.hkd)}`).join(' · ');
  })();
  const cash = exps.filter((e) => e.kind === 'cash').reduce((n, e) => n + hk(e), 0);
  const deposit = exps.filter((e) => e.kind === 'deposit').reduce((n, e) => n + hk(e), 0);
  const unknown = exps.filter((e) => e.amount === null).length;

  // Money spent so far (paid before the trip + spent during it), by kind of expense
  const spentByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of exps) if (e.kind === 'spend' && e.amount && (e.status === 'paid' || e.status === 'actual')) m[normCat(e.category)] = (m[normCat(e.category)] ?? 0) + hk(e);
    const order = (c: string) => CATEGORIES.indexOf(c);
    return Object.keys({ ...Object.fromEntries(CATEGORIES.map((c) => [c, 0])), ...m }).map((c) => [c, m[c] ?? 0] as [string, number])
      .sort((x, y) => (y[1] > 0 ? 1 : 0) - (x[1] > 0 ? 1 : 0) || y[1] - x[1] || order(x[0]) - order(y[0]));
  }, [exps, r]); // eslint-disable-line react-hooks/exhaustive-deps
  const spentTotalCat = spentByCat.reduce((n, [, v]) => n + v, 0);
  const capPHP = state.settings.capPHP ?? 150000;
  const spentPhp = hkdToPhp(paidTotal, r), plannedPhp = hkdToPhp(remaining, r), optionalPhp = hkdToPhp(optionalTotal, r);
  const usedPhp = spentPhp + plannedPhp; const leftPhp = capPHP - usedPhp;
  const capState = leftPhp < 0 ? 'over' : usedPhp / capPHP >= 0.9 ? 'close' : 'ok';
  const budgetPct = everything ? Math.min(1, paidTotal / everything) : 0;

  return (
    <div className="pb-4">
      <PageHeader title="Expenses" back="more" sub={`HK$1 ≈ ₱${r.hkdToPhp.toFixed(2)}${r.manual ? ' (your rate)' : r.fetchedAt ? '' : ' (estimate)'}`}
        right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />

      <Card className="mb-3 overflow-hidden !bg-navy p-5 text-white">
        <div className="text-[12px] font-bold uppercase tracking-wide text-white/65">Spent so far</div>
        <div className="font-display text-[34px] font-bold leading-tight text-sun">{fmtBoth(paidTotal, r)}</div>
        <div className="mt-1 text-[14px] text-white/80">{paidBreakdown}</div>
      </Card>

      <Card className="mb-3 p-4">
        <div className="flex items-start justify-between gap-2"><div><div className="text-[12px] font-bold uppercase tracking-wide text-muted">Budget cap · whole trip</div><div className="font-display text-[26px] font-bold leading-tight text-navy">{fmtPHP(capPHP)}</div><div className="text-[13px] text-muted">≈ {fmtHKD(capPHP / r.hkdToPhp)}</div></div>
          <button onClick={() => setCapEdit(true)} className="tap inline-flex items-center gap-1.5 rounded-xl bg-paper px-3 text-[13px] font-bold text-sky"><Pencil size={14} />Change</button></div>
        <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-paper" role="img" aria-label={`Spent ${Math.round(spentPhp)} and planned ${Math.round(plannedPhp)} of ${capPHP} pesos`}>
          <motion.div className="h-full bg-turq" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (spentPhp / capPHP) * 100)}%` }} transition={{ duration: 0.9 }} />
          <motion.div className={cx('h-full', capState === 'over' ? 'bg-coral' : 'bg-sun')} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100 - (spentPhp / capPHP) * 100, (plannedPhp / capPHP) * 100))}%` }} transition={{ duration: 0.9, delay: 0.1 }} />
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 text-[12px] text-muted"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-turq" />Spent {fmtPHP(spentPhp)}</span><span><i className={cx('mr-1 inline-block h-2 w-2 rounded-full', capState === 'over' ? 'bg-coral' : 'bg-sun')} />Planned {fmtPHP(plannedPhp)}</span></div>
        <div className={cx('mt-3 rounded-2xl px-4 py-3 text-[15px] font-bold', capState === 'over' ? 'bg-coral-soft text-[#a63a2b]' : capState === 'close' ? 'bg-sun-soft text-[#6d4b00]' : 'bg-turq-soft text-[#0b6b61]')}>
          {capState === 'over' ? `Over the cap by ${fmtPHP(-leftPhp)} — time to trim something.` : `${fmtPHP(leftPhp)} left under the cap${capState === 'close' ? ' — getting close!' : ''}`}
        </div>
        {optionalPhp > 0 && <p className="mt-2 text-[13px] text-muted">Optional extras ({fmtPHP(optionalPhp)}) are not counted. If you do them all you would have {leftPhp - optionalPhp >= 0 ? `${fmtPHP(leftPhp - optionalPhp)} left` : `go over by ${fmtPHP(optionalPhp - leftPhp)}`}.</p>}
        {unknown > 0 && <p className="mt-2 text-[13px] text-muted">{unknown} item{unknown > 1 ? 's' : ''} still have no price, so the real total may be higher.</p>}
      </Card>

      <Card className="mb-3 flex items-center justify-between gap-3 p-4"><div><div className="text-[12px] font-bold uppercase text-muted">Spent + Planned</div><div className="text-[13px] text-muted">not counting optional</div></div><div className="text-right"><div className="font-display text-[22px] font-bold text-navy">{fmtHKD(everything)}</div><div className="text-[13px] text-muted">{fmtPHP(hkdToPhp(everything, r))}</div></div></Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat title="Planned (still to spend)" value={fmtHKD(remaining)} sub={fmtPHP(hkdToPhp(remaining, r))} tone="bg-sun-soft" />
        <Stat title="Optional (only if we want)" value={fmtHKD(optionalTotal)} sub={fmtPHP(hkdToPhp(optionalTotal, r))} tone="bg-lav-soft" />
      </div>

      <Card className="mt-3 p-4">
        <div className="mb-1 flex justify-between text-[14px] font-bold text-navy"><span>Spent vs Spent + Planned</span><span>{Math.round(budgetPct * 100)}%</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-sky-soft"><motion.div className={cx('h-full rounded-full', 'bg-turq')} initial={{ width: 0 }} animate={{ width: `${budgetPct * 100}%` }} transition={{ duration: 0.9 }} /></div>
        {unknown > 0 && <p className="mt-2 text-[13px] text-muted">{unknown} item{unknown > 1 ? 's' : ''} have no price yet (PhotoPass, PAL baggage, tickets…). Add them as you know them.</p>}
      </Card>

      <SectionTitle action={<a href="#/more/shopping" className="tap flex items-center text-[14px] font-bold text-sky">Shopping list</a>}>Spent by category</SectionTitle>
      <Card className="space-y-3 p-4">
        {spentByCat.map(([c, v]) => (
          <div key={c}><div className="mb-1 flex items-baseline justify-between gap-2 text-[13px]"><span className="font-bold text-navy">{c}</span><span className="text-right text-muted"><b className="text-navy">{fmtPHP(hkdToPhp(v, r))}</b> · {fmtHKD(v)}</span></div>
            <div className="h-3 overflow-hidden rounded-full bg-paper"><motion.div className="h-full rounded-full" style={{ background: COLORS[c] ?? '#3aa8f5' }} initial={{ width: 0 }} animate={{ width: `${spentTotalCat ? (v / spentTotalCat) * 100 : 0}%` }} transition={{ duration: 0.8 }} /></div></div>
        ))}
        <p className="text-[12px] text-muted">Everything you have paid or spent so far, by kind of expense. Each bar is that category’s share of your total spending.</p>
      </Card>

      <SectionTitle>By day</SectionTitle>
      <Card className="divide-y divide-navy/5">
        {DAYS.map((d) => {
          const est = dayEstimate(acts, d.id) + exps.filter((e) => e.day === d.id && e.kind === 'spend' && e.status === 'estimated').reduce((n, e) => n + hk(e), 0); const act = exps.filter((e) => e.day === d.id && e.kind === 'spend' && e.status === 'actual').reduce((n, e) => n + hk(e), 0);
          return <div key={d.id} className="flex items-center gap-3 px-4 py-3"><div className="w-12 text-[13px] font-bold text-navy">Day {d.id}</div><div className="min-w-0 flex-1 truncate text-[13px] text-muted">{d.title}</div><div className="text-right text-[13px]"><div className="font-bold text-navy">{fmtHKD(act)} <span className="font-normal text-muted">/ {fmtHKD(est)}</span></div></div></div>;
        })}
      </Card>

      <SectionTitle>Hotel deposit</SectionTitle>
      <Card className="flex items-center gap-3 p-4 text-[14px]"><PiggyBank className="shrink-0 text-lav" /><div>HK${deposit} deposit is tracked separately — potentially refundable, so it is <b>not</b> counted as spending. Update its status in Flights &amp; Hotel.</div></Card>

      <SectionTitle>All entries</SectionTitle>
      <div className="space-y-2">
        {exps.map((e) => (
          <Card key={e.id} className="p-3.5" onClick={() => setEdit(e)}>
            <div className="flex items-start gap-3">
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[normCat(e.category)] ?? '#3aa8f5' }} />
              <div className="min-w-0 flex-1"><div className="text-[15px] font-bold leading-snug text-navy">{e.label}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]"><span className="text-muted">{normCat(e.category)}{e.day ? ` · Day ${e.day}` : ''}</span>
                  {e.status === 'paid' ? <StatusPill status="paid" /> : e.status === 'actual' ? <StatusPill status="confirmed" label="Spent" /> : e.status === 'optional' ? <StatusPill status="optional" /> : <StatusPill status="estimated" label="Planned" />}
                  {e.kind === 'deposit' && <span className="rounded-full bg-lav-soft px-2 py-0.5 font-bold text-[#5046b4]">Refundable</span>}{e.kind === 'cash' && <span className="rounded-full bg-lav-soft px-2 py-0.5 font-bold text-[#5046b4]">Cash · not spending</span>}</div>
                {e.note && <div className="mt-1 text-[12px] text-muted">{e.note}</div>}
                {e.status === 'estimated' && e.kind === 'spend' && <button onClick={(ev) => { ev.stopPropagation(); update(e.id, { status: e.day ? 'actual' : 'paid' }); }} className="tap mt-2 rounded-xl bg-turq-soft px-3 text-[13px] font-bold text-[#0b6b61]">✓ Mark as {e.day ? 'spent' : 'paid'}</button>}</div>
              <div className="text-right">{e.amount !== null ? <><div className="text-[15px] font-bold text-navy">{fmtNative(e.amount, e.currency, r)}</div><div className="text-[12px] text-muted">{e.currency === 'HKD' ? fmtPHP(hkdToPhp(e.amount, r)) : fmtHKD(hk(e))}</div></> : <div className="text-[12px] font-bold text-coral">Add price</div>}</div>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Exchange rates</SectionTitle>
      <Card className="space-y-2 p-4 text-[14px]">
        <div className="flex items-center gap-2"><Banknote className="text-sky" /><div>HK$1 = ₱{r.hkdToPhp.toFixed(3)}</div></div>
        <p className="text-[13px] text-muted">{r.fetchedAt ? `Live rate fetched ${new Date(r.fetchedAt).toLocaleString()}.` : r.manual ? 'Rate set by you.' : 'This is a placeholder estimate, not your Wise rate. Tap refresh when online, or set your own.'}</p>
        <div className="flex gap-2">
          <Btn variant="soft" icon={<RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />} className="flex-1 text-[14px]" onClick={async () => { setFetching(true); const n = await fetchRates(); setFetching(false); if (n) setSettings({ rates: n }); else alert('Could not fetch a live rate (offline?). Your current rate is kept.'); }}>Refresh</Btn>
          <Btn variant="ghost" icon={<Pencil size={16} />} className="flex-1 text-[14px]" onClick={() => setRateEdit(true)}>Set my rate</Btn>
        </div>
      </Card>

      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit entry" fields={FIELDS}
        values={edit ? { label: edit.label, amount: edit.currency === 'USD' && edit.amount ? Math.round(usdToPhp(edit.amount, r) * 100) / 100 : edit.amount, currency: edit.currency === 'USD' ? 'PHP' : edit.currency, category: normCat(edit.category), status: edit.status, kind: edit.kind, day: edit.day ?? '', note: edit.note ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { label: String(v.label || edit.label), amount: v.amount as number | null, currency: v.currency as Currency, category: String(v.category), status: v.status as Expense['status'], kind: v.kind as Expense['kind'], day: v.day ? Number(v.day) : undefined, note: String(v.note ?? '') })}
        onDelete={edit ? () => remove(edit.id) : undefined} onRestore={edit && isSeed(edit.id) && isEdited(edit.id) ? () => restore(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Add spending" saveLabel="Add" fields={FIELDS}
        values={{ label: '', amount: '', currency: 'HKD', category: 'Food', status: 'actual', kind: 'spend', day: currentDayId() ?? '', note: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), label: String(v.label || 'Expense'), amount: v.amount as number | null, currency: v.currency as Currency, category: String(v.category), status: v.status as Expense['status'], kind: v.kind as Expense['kind'], day: v.day ? Number(v.day) : undefined, note: String(v.note ?? '') })} />
      <EditSheet open={capEdit} onClose={() => setCapEdit(false)} title="Budget cap (pesos)" fields={[{ key: 'cap', label: 'Most we want to spend on the whole trip (₱)', type: 'number', hint: 'Counts everything: flights, hotel, tickets, food, shopping — not optional items.' }]}
        values={{ cap: capPHP }} onRestore={() => setSettings({ capPHP: 150000 })} onSave={(v) => setSettings({ capPHP: Number(v.cap) > 0 ? Number(v.cap) : capPHP })} />
      <EditSheet open={rateEdit} onClose={() => setRateEdit(false)} title="My exchange rate" fields={[
        { key: 'hkdToPhp', label: 'Pesos for HK$1 (₱ per HK$)', type: 'number', hint: 'Use the rate your Wise app shows.' }]}
        values={{ hkdToPhp: r.hkdToPhp }} onRestore={() => setSettings({ rates: DEFAULT_RATES })}
        onSave={(v) => setSettings({ rates: { hkdToPhp: Number(v.hkdToPhp) || r.hkdToPhp, usdToHkd: r.usdToHkd, manual: true } })} />
    </div>
  );
}
const Stat = ({ title, value, sub, tone }: { title: string; value: string; sub: string; tone: string }) => (
  <div className={cx('rounded-3xl p-4', tone)}><div className="text-[12px] font-bold uppercase text-navy/60">{title}</div><div className="font-display text-[22px] font-bold leading-tight text-navy">{value}</div><div className="text-[13px] text-navy/70">{sub}</div></div>
);
