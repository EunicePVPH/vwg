import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, PiggyBank, Pencil, Plus, RefreshCw } from 'lucide-react';
import { ACTIVITIES, DAYS, EXPENSES, EXPENSE_CATEGORIES } from '../data/seed';
import { useAppState, useCollection, useSettings } from '../state/store';
import { catOf, dayEstimate } from '../lib/trip';
import { currentDayId } from '../lib/time';
import { fetchRates, fmtBoth, fmtHKD, fmtNative, fmtPHP, hkdToPhp, toHKD, DEFAULT_RATES } from '../lib/money';
import { Btn, Card, PageHeader, SectionTitle, StatusPill, cx } from '../ui/primitives';
import { EditSheet, type Field } from '../ui/EditSheet';
import type { Activity, Currency, Expense } from '../types';

const COLORS: Record<string, string> = { Flights: '#3aa8f5', Hotel: '#8f84ee', Transport: '#14b8a6', Food: '#ff6b57', Attractions: '#ffc83d', 'Disney PhotoPass': '#ff9fbd', Shopping: '#12284c', Health: '#5fd3c5', 'SIM / eSIM': '#7cc4ff', Cash: '#a0aec0', Other: '#cbd5e1' };

const FIELDS: Field[] = [
  { key: 'label', label: 'What was it for?', type: 'text' },
  { key: 'amount', label: 'Amount (leave empty if not known yet)', type: 'number' },
  { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'HKD', label: 'HK$ (HKD)' }, { value: 'PHP', label: '₱ (PHP)' }, { value: 'USD', label: 'US$ (USD)' }] },
  { key: 'category', label: 'Category', type: 'select', options: EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })) },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'actual', label: 'Spent during the trip (counts in “Spent”)' }, { value: 'estimated', label: 'Planned — not paid yet' }, { value: 'paid', label: 'Paid before the trip' }] },
  { key: 'kind', label: 'Type', type: 'select', options: [{ value: 'spend', label: 'Spending' }, { value: 'deposit', label: 'Deposit (refundable, not spending)' }, { value: 'cash', label: 'Cash withdrawal (not spending)' }] },
  { key: 'day', label: 'Trip day (1–5, optional)', type: 'number' },
  { key: 'note', label: 'Note', type: 'text' },
];

export function Money() {
  const { items: exps, update, add, remove, restore, isEdited, isSeed } = useCollection<Expense>('expenses', EXPENSES);
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const { state } = useAppState(); const { setSettings } = useSettings(); const r = state.settings.rates;
  const [edit, setEdit] = useState<Expense | null>(null);
  const [adding, setAdding] = useState(false);
  const [rateEdit, setRateEdit] = useState(false);
  const [fetching, setFetching] = useState(false);

  const hk = (e: Expense) => (e.amount ? toHKD(e.amount, e.currency, r) : 0);
  const prepaid = exps.filter((e) => e.kind === 'spend' && e.status === 'paid').reduce((n, e) => n + hk(e), 0);
  const upcoming = exps.filter((e) => e.kind === 'spend' && e.status === 'estimated').reduce((n, e) => n + hk(e), 0);
  const actual = exps.filter((e) => e.kind === 'spend' && e.status === 'actual').reduce((n, e) => n + hk(e), 0);
  const plannedEntries = exps.filter((e) => e.kind === 'spend' && e.status === 'estimated' && e.day && e.category !== 'Hotel').reduce((n, e) => n + hk(e), 0);
  const planned = acts.reduce((n, a) => n + (a.costHKD ?? 0), 0) + plannedEntries;
  const everything = prepaid + upcoming + actual;
  const cash = exps.filter((e) => e.kind === 'cash').reduce((n, e) => n + hk(e), 0);
  const deposit = exps.filter((e) => e.kind === 'deposit').reduce((n, e) => n + hk(e), 0);
  const unknown = exps.filter((e) => e.amount === null).length;
  const palPhp = exps.filter((e) => e.category === 'Flights' && e.status === 'paid').reduce((n, e) => n + (e.currency === 'PHP' ? e.amount ?? 0 : hkdToPhp(hk(e), r)), 0);

  const cats = useMemo(() => {
    const m: Record<string, { est: number; act: number }> = {};
    for (const a of acts) if (a.costHKD) { const c = catOf(a); (m[c] ??= { est: 0, act: 0 }).est += a.costHKD; }
    for (const e of exps) if (e.kind === 'spend' && e.status === 'estimated' && e.day && e.amount && e.category !== 'Hotel') (m[e.category] ??= { est: 0, act: 0 }).est += hk(e);
    for (const e of exps) if (e.kind === 'spend' && e.status === 'actual' && e.amount) (m[e.category] ??= { est: 0, act: 0 }).act += hk(e);
    return Object.entries(m).filter(([c]) => c !== 'Flights' && c !== 'Other').sort((a, b) => b[1].est + b[1].act - (a[1].est + a[1].act));
  }, [acts, exps, r]); // eslint-disable-line react-hooks/exhaustive-deps
  const max = Math.max(1, ...cats.map(([, v]) => Math.max(v.est, v.act)));
  const budgetPct = planned ? Math.min(1, actual / planned) : 0;

  return (
    <div className="pb-4">
      <PageHeader title="Expenses" back="more" sub={`HK$1 ≈ ₱${r.hkdToPhp.toFixed(2)}${r.manual ? ' (your rate)' : r.fetchedAt ? '' : ' (estimate)'}`}
        right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />

      <Card className="mb-3 overflow-hidden !bg-navy p-5 text-white">
        <div className="text-[12px] font-bold uppercase tracking-wide text-white/65">Already paid — not a future expense</div>
        <div className="font-display text-[34px] font-bold leading-tight text-sun">{fmtBoth(prepaid, r)}</div>
        <div className="mt-1 text-[14px] text-white/80">Flights ₱{palPhp.toLocaleString('en-US', { maximumFractionDigits: 2 })} (PAL ₱14,784 + Cebu ₱40,815.93 = ₱55,599.93) · hotel US$264.44</div>
      </Card>

      <Card className="mb-3 flex items-center justify-between gap-3 p-4"><div><div className="text-[12px] font-bold uppercase text-muted">Everything so far</div><div className="text-[13px] text-muted">paid + still to pay + spent</div></div><div className="text-right"><div className="font-display text-[22px] font-bold text-navy">{fmtHKD(everything)}</div><div className="text-[13px] text-muted">{fmtPHP(hkdToPhp(everything, r))}</div></div></Card>

      <div className="grid grid-cols-2 gap-3">
        <Stat title="Trip budget (planned)" value={fmtHKD(planned)} sub={fmtPHP(hkdToPhp(planned, r))} tone="bg-sky-soft" />
        <Stat title="Spent on the trip so far" value={fmtHKD(actual)} sub={fmtPHP(hkdToPhp(actual, r))} tone="bg-turq-soft" />
        <Stat title="Still to pay (known)" value={fmtHKD(upcoming)} sub="Planned, not yet paid" tone="bg-sun-soft" />
        <Stat title="Cash planned" value={fmtHKD(cash)} sub="Not an expense" tone="bg-lav-soft" />
      </div>

      <Card className="mt-3 p-4">
        <div className="mb-1 flex justify-between text-[14px] font-bold text-navy"><span>Spent vs planned</span><span>{Math.round(budgetPct * 100)}%</span></div>
        <div className="h-3 overflow-hidden rounded-full bg-sky-soft"><motion.div className={cx('h-full rounded-full', actual > planned && planned ? 'bg-coral' : 'bg-turq')} initial={{ width: 0 }} animate={{ width: `${budgetPct * 100}%` }} transition={{ duration: 0.9 }} /></div>
        {unknown > 0 && <p className="mt-2 text-[13px] text-muted">{unknown} item{unknown > 1 ? 's' : ''} have no price yet (PhotoPass, PAL baggage, tickets…). Add them as you know them.</p>}
      </Card>

      <SectionTitle>By category (planned vs actual)</SectionTitle>
      <Card className="space-y-3 p-4">
        {cats.map(([c, v]) => (
          <div key={c}><div className="mb-1 flex justify-between text-[13px]"><span className="font-bold text-navy">{c}</span><span className="text-muted">{fmtHKD(v.act)} / {fmtHKD(v.est)}</span></div>
            <div className="relative h-3 overflow-hidden rounded-full bg-paper"><motion.div className="absolute inset-y-0 left-0 rounded-full opacity-35" style={{ background: COLORS[c] ?? '#3aa8f5' }} initial={{ width: 0 }} animate={{ width: `${(v.est / max) * 100}%` }} transition={{ duration: 0.8 }} />
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: COLORS[c] ?? '#3aa8f5' }} initial={{ width: 0 }} animate={{ width: `${(v.act / max) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 }} /></div></div>
        ))}
        <p className="text-[12px] text-muted">Light bar = planned, solid = actual. Flights and hotel are shown above as already paid.</p>
      </Card>

      <SectionTitle>By day</SectionTitle>
      <Card className="divide-y divide-navy/5">
        {DAYS.map((d) => {
          const est = dayEstimate(acts, d.id) + exps.filter((e) => e.day === d.id && e.kind === 'spend' && e.status === 'estimated' && e.category !== 'Hotel').reduce((n, e) => n + hk(e), 0); const act = exps.filter((e) => e.day === d.id && e.kind === 'spend' && e.status === 'actual').reduce((n, e) => n + hk(e), 0);
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
              <span className="mt-1 h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[e.category] ?? '#3aa8f5' }} />
              <div className="min-w-0 flex-1"><div className="text-[15px] font-bold leading-snug text-navy">{e.label}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px]"><span className="text-muted">{e.category}{e.day ? ` · Day ${e.day}` : ''}</span>
                  {e.status === 'paid' ? <StatusPill status="paid" /> : e.status === 'actual' ? <StatusPill status="confirmed" label="Spent" /> : <StatusPill status="estimated" label="Planned" />}
                  {e.kind === 'deposit' && <span className="rounded-full bg-lav-soft px-2 py-0.5 font-bold text-[#5046b4]">Refundable</span>}{e.kind === 'cash' && <span className="rounded-full bg-lav-soft px-2 py-0.5 font-bold text-[#5046b4]">Cash · not spending</span>}</div>
                {e.note && <div className="mt-1 text-[12px] text-muted">{e.note}</div>}
                {e.status === 'estimated' && e.kind === 'spend' && <button onClick={(ev) => { ev.stopPropagation(); update(e.id, { status: e.day ? 'actual' : 'paid' }); }} className="tap mt-2 rounded-xl bg-turq-soft px-3 text-[13px] font-bold text-[#0b6b61]">✓ Mark as {e.day ? 'spent' : 'paid'}</button>}</div>
              <div className="text-right">{e.amount !== null ? <><div className="text-[15px] font-bold text-navy">{fmtNative(e.amount, e.currency)}</div><div className="text-[12px] text-muted">{e.currency === 'HKD' ? fmtPHP(hkdToPhp(e.amount, r)) : fmtHKD(hk(e))}</div></> : <div className="text-[12px] font-bold text-coral">Add price</div>}</div>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>Exchange rates</SectionTitle>
      <Card className="space-y-2 p-4 text-[14px]">
        <div className="flex items-center gap-2"><Banknote className="text-sky" /><div>HK$1 = ₱{r.hkdToPhp.toFixed(3)} · US$1 = HK${r.usdToHkd.toFixed(3)}</div></div>
        <p className="text-[13px] text-muted">{r.fetchedAt ? `Live rate fetched ${new Date(r.fetchedAt).toLocaleString()}.` : r.manual ? 'Rate set by you.' : 'This is a placeholder estimate, not your Wise rate. Tap refresh when online, or set your own.'}</p>
        <div className="flex gap-2">
          <Btn variant="soft" icon={<RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />} className="flex-1 text-[14px]" onClick={async () => { setFetching(true); const n = await fetchRates(); setFetching(false); if (n) setSettings({ rates: n }); else alert('Could not fetch a live rate (offline?). Your current rate is kept.'); }}>Refresh</Btn>
          <Btn variant="ghost" icon={<Pencil size={16} />} className="flex-1 text-[14px]" onClick={() => setRateEdit(true)}>Set my rate</Btn>
        </div>
      </Card>

      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit entry" fields={FIELDS}
        values={edit ? { label: edit.label, amount: edit.amount, currency: edit.currency, category: edit.category, status: edit.status, kind: edit.kind, day: edit.day ?? '', note: edit.note ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { label: String(v.label || edit.label), amount: v.amount as number | null, currency: v.currency as Currency, category: String(v.category), status: v.status as Expense['status'], kind: v.kind as Expense['kind'], day: v.day ? Number(v.day) : undefined, note: String(v.note ?? '') })}
        onDelete={edit ? () => remove(edit.id) : undefined} onRestore={edit && isSeed(edit.id) && isEdited(edit.id) ? () => restore(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Add spending" saveLabel="Add" fields={FIELDS}
        values={{ label: '', amount: '', currency: 'HKD', category: 'Food', status: 'actual', kind: 'spend', day: currentDayId() ?? '', note: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), label: String(v.label || 'Expense'), amount: v.amount as number | null, currency: v.currency as Currency, category: String(v.category), status: v.status as Expense['status'], kind: v.kind as Expense['kind'], day: v.day ? Number(v.day) : undefined, note: String(v.note ?? '') })} />
      <EditSheet open={rateEdit} onClose={() => setRateEdit(false)} title="My exchange rate" fields={[
        { key: 'hkdToPhp', label: 'Pesos for HK$1 (₱ per HK$)', type: 'number', hint: 'Use the rate your Wise app shows.' }, { key: 'usdToHkd', label: 'HK$ for US$1', type: 'number' }]}
        values={{ hkdToPhp: r.hkdToPhp, usdToHkd: r.usdToHkd }} onRestore={() => setSettings({ rates: DEFAULT_RATES })}
        onSave={(v) => setSettings({ rates: { hkdToPhp: Number(v.hkdToPhp) || r.hkdToPhp, usdToHkd: Number(v.usdToHkd) || r.usdToHkd, manual: true } })} />
    </div>
  );
}
const Stat = ({ title, value, sub, tone }: { title: string; value: string; sub: string; tone: string }) => (
  <div className={cx('rounded-3xl p-4', tone)}><div className="text-[12px] font-bold uppercase text-navy/60">{title}</div><div className="font-display text-[22px] font-bold leading-tight text-navy">{value}</div><div className="text-[13px] text-navy/70">{sub}</div></div>
);
