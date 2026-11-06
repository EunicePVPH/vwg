import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronDown, Copy, Eye, MoreVertical, Plus, Search, SlidersHorizontal, Trash2, Undo2, X } from 'lucide-react';
import { DAYS, EXPENSES } from '../data/seed';
import { BAGS, DAYBAG, DEFAULT_CATS, FINALS, INV } from '../data/pack';
import { DEFAULT_UI, PEOPLE, SHOP_STATUSES, type Bag, type DayItem, type FinalItem, type FinalList, type Inv, type PackUI, type Person, type Place, type ShopStatus } from '../lib/packTypes';
import { countsFor, isNN, itemDone, packedQty, placeDone, shopReady, tally, type Tally } from '../lib/pack';
import { useAppState, useChecks, useCollection } from '../state/store';
import { useVault } from '../state/vault';
import { readOriginal } from '../lib/vault';
import { dateLabel } from '../lib/time';
import { fmtNative } from '../lib/money';
import { Btn, Sheet, Toggle, cx } from '../ui/primitives';
import { Confetti } from '../ui/Confetti';
import { EditSheet, type Field } from '../ui/EditSheet';
import { go } from '../ui/router';
import type { Expense } from '../types';

const TABS: [PackUI['tab'], string][] = [['shop', 'Shopping'], ['clothes', 'Clothes'], ['bags', 'Bags'], ['days', 'Day Bags'], ['final', 'Final Checks']];
const FLISTS: [FinalList, string][] = [['leave', 'Leave Home'], ['night', 'Night Before'], ['morning', 'Hotel Morning'], ['checkout', 'Hotel Checkout'], ['home', 'Home Again']];
const BOUGHT: ShopStatus[] = ['Ordered', 'Purchased / Awaiting Delivery', 'Received'];
const uid = () => 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const input = 'w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3 text-[16px]';
const SHOP_DOT: Record<string, string> = { 'Not Reviewed': 'bg-navy/20', 'Already Have': 'bg-turq', 'Need to Buy': 'bg-coral', Ordered: 'bg-sky', 'Purchased / Awaiting Delivery': 'bg-sky', Received: 'bg-turq', 'Not Needed': 'bg-navy/10' };
const dayPill = (d: number) => `Day ${d} (${dateLabel(DAYS[d - 1].date, { day: 'numeric', month: 'short' })})`;

interface Menu { kind: 'inv' | 'day' | 'final'; id: string; ctx: 'shop' | 'clothes' | 'bags' | 'other'; place?: number; dayCtx?: number }
type Dlg = null | { type: 'photo' | 'edit' | 'qty' | 'person' | 'days' | 'status' | 'expense' | 'cats' | 'bags' | 'weights' | 'view' | 'add' | 'editLite'; id?: string };


type Coll<T extends { id: string }> = ReturnType<typeof useCollection<T>>;
interface PackApi {
  inv: Coll<Inv>; bagsC: Coll<Bag>; dayC: Coll<DayItem>; finC: Coll<FinalItem>; exps: Coll<Expense>;
  bags: Bag[]; bagName: (id: string) => string; ui: PackUI; setUI: (p: Partial<PackUI>) => void;
  say: (m: string, undo?: () => void) => void; setToast: (t: null) => void; dlg: Dlg; setDlg: (d: Dlg) => void; setMenu: (m: Menu | null) => void;
  getInv: (id?: string) => Inv | undefined; upd: (id: string, p: Partial<Inv>) => void; changeShop: (i: Inv, s: ShopStatus) => void; expCat: (i: Inv) => string;
  vault: ReturnType<typeof useVault>;
  visibleCats: string[]; cats: string[]; dayItems: DayItem[]; finalItems: FinalItem[]; addDefaultsTitle: string;
}
const PackCtx = createContext<PackApi | null>(null);
const usePack = () => { const c = useContext(PackCtx); if (!c) throw new Error('pack'); return c; };

export function Packing({ param }: { param: string[] }) {
  const inv = useCollection<Inv>('inv', INV);
  const bagsC = useCollection<Bag>('bags', BAGS);
  const dayC = useCollection<DayItem>('daybag', DAYBAG);
  const finC = useCollection<FinalItem>('finals', FINALS);
  const exps = useCollection<Expense>('expenses', EXPENSES);
  const vault = useVault();
  const { checks, toggle } = useChecks();
  const { state, setState } = useAppState(); const r = state.settings.rates;
  const ui: PackUI = { ...DEFAULT_UI, ...state.packUI };
  const setUI = (p: Partial<PackUI>) => setState((s) => ({ ...s, packUI: { ...DEFAULT_UI, ...s.packUI, ...p } }));
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState<Menu | null>(null);
  const [dlg, setDlg] = useState<Dlg>(null);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
  const toastT = useRef<number | undefined>(undefined);
  const say = (msg: string, undo?: () => void) => { setToast({ msg, undo }); window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => setToast(null), 7000); };

  // remember scroll position per list (so coming back lands where you left off)
  const scrollKey = ['pk', ui.tab, ui.tab === 'clothes' ? ui.person : ui.tab === 'bags' ? ui.bag : ui.tab === 'days' ? ui.day : ui.tab === 'final' ? ui.fList + ui.fDay : ui.shopFilter].join('|');
  const keyRef = useRef(scrollKey); keyRef.current = scrollKey;
  useEffect(() => {
    const y = readScroll(scrollKey); const go = () => window.scrollTo(0, y);
    go(); const t1 = setTimeout(go, 120), t2 = setTimeout(go, 450);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [scrollKey]);
  useEffect(() => {
    let t: number | undefined;
    const on = () => { window.clearTimeout(t); t = window.setTimeout(() => { if (location.hash.startsWith('#/more/packing')) writeScroll(keyRef.current, window.scrollY); }, 120); };
    window.addEventListener('scroll', on, { passive: true });
    return () => { window.removeEventListener('scroll', on); window.clearTimeout(t); };
  }, []);

  // deep link: #/more/packing/day/2
  useEffect(() => { if (param[0] === 'day' && Number(param[1]) >= 1 && Number(param[1]) <= 5) { writeScroll('pk|days|' + Number(param[1]), 0); setUI({ tab: 'days', day: Number(param[1]) }); } }, [param.join('/')]); // eslint-disable-line react-hooks/exhaustive-deps

  const bags = [...bagsC.items].sort((a, b) => a.order - b.order);
  const bagName = (id: string) => bags.find((b) => b.id === id)?.name ?? 'Unassigned';
  const cats = useMemo(() => {
    const seen = new Set<string>([...DEFAULT_CATS, ...(ui.extraCats ?? [])]);
    inv.items.filter((i) => i.group === 'general' || i.shopListed).forEach((i) => seen.add(i.cat));
    const base = [...seen]; const order = ui.catOrder ?? [];
    const pos = (c: string) => { const k = order.indexOf(c); return k < 0 ? 1000 + base.indexOf(c) : k; };
    return base.sort((a, b) => pos(a) - pos(b));
  }, [inv.items, ui.extraCats, ui.catOrder]); // eslint-disable-line react-hooks/exhaustive-deps
  const visibleCats = cats.filter((c) => !(ui.hiddenCats ?? []).includes(c));

  // ------------ item operations ------------
  const getInv = (id?: string) => inv.items.find((i) => i.id === id);
  const upd = (id: string, p: Partial<Inv>) => inv.update(id, p);
  const setNN = (i: Inv, on: boolean) => upd(i.id, on ? { notNeeded: true, shop: 'Not Needed' } : { notNeeded: false, shop: i.shop === 'Not Needed' ? 'Not Reviewed' : i.shop });
  const toggleLine = (i: Inv, pi: number) => upd(i.id, { places: i.places.map((p, k) => (k === pi ? { ...p, packed: placeDone(p) ? 0 : p.qty } : p)) });
  const toggleItem = (i: Inv) => {
    if (i.worn) return upd(i.id, { worn: false });
    if (itemDone(i)) return upd(i.id, { places: i.places.map((p) => ({ ...p, packed: 0 })) });
    upd(i.id, { places: i.places.length ? i.places.map((p) => ({ ...p, packed: p.qty })) : [{ bag: 'main', qty: i.qty, packed: i.qty }] });
  };
  const changeShop = (i: Inv, s: ShopStatus) => {
    upd(i.id, { shop: s, notNeeded: s === 'Not Needed' ? true : i.notNeeded && i.shop === 'Not Needed' ? false : i.notNeeded });
    if (BOUGHT.includes(s) && !BOUGHT.includes(i.shop) && !(i.expenseId && exps.items.some((e) => e.id === i.expenseId))) setDlg({ type: 'expense', id: i.id });
  };
  const duplicate = (i: Inv) => { inv.add({ ...i, id: uid(), name: i.name + ' (copy)', expenseId: undefined, places: i.places.map((p) => ({ ...p, packed: 0 })) }); say('Duplicated'); };
  const deleteInv = (i: Inv) => {
    const multi = i.places.length > 1 || (i.days?.length ?? 0) > 1;
    if (!confirm(`Delete “${i.name}” from your inventory?${multi ? '\nIt appears in several bags or days.' : ''}\nExpenses and tickets are not touched.`)) return;
    const wasSeed = inv.isSeed(i.id); inv.remove(i.id);
    say('Item deleted', () => { if (wasSeed) inv.restore(i.id); else inv.add({ ...i, id: uid() }); setToast(null); });
  };
  const expCat = (i: Inv) => (i.group === 'clothes' ? 'OOTD' : ['Toiletries', 'Medicines & first aid', 'Aya: hygiene, feeding & comfort'].includes(i.cat) ? 'Essentials' : 'Shopping');

  // ------------ counters / rows ------------
  const ready = (i: Inv) => shopReady(i);
  const shopItems = inv.items.filter((i) => i.shopListed !== false);
  const clothes = inv.items.filter((i) => i.group === 'clothes' && i.person === ui.person && i.shopListed !== true || (i.group === 'clothes' && i.person === ui.person));
  const lines = inv.items.flatMap((i) => i.places.map((p, pi) => ({ i, p, pi }))).filter((l) => l.p.bag === ui.bag);
  const dayItems = dayC.items.filter((d) => d.day === ui.day);
  const fDays = ui.fList === 'morning' ? [2, 3, 4] : ui.fList === 'night' ? [1, 2, 3, 4] : [];
  const fKey = (it: FinalItem) => (it.list === 'morning' || it.list === 'night' ? `fc:${ui.fDay}:${it.id}` : `fc:${it.id}`);
  const finalItems = finC.items.filter((f) => f.list === ui.fList);

  let counter: Tally; let word = 'Packed'; let celebrateKey = ui.tab;
  if (ui.tab === 'shop') { word = 'Ready'; counter = tally(shopItems.map((i) => ({ done: ready(i), counts: countsFor(i, ready(i)) }))); }
  else if (ui.tab === 'clothes') { celebrateKey += ui.person; counter = tally(clothes.map((i) => ({ done: itemDone(i), counts: countsFor(i, itemDone(i)) }))); }
  else if (ui.tab === 'bags') { celebrateKey += ui.bag; counter = tally(lines.map((l) => ({ done: placeDone(l.p), counts: countsFor(l.i, placeDone(l.p)) }))); }
  else if (ui.tab === 'days') { celebrateKey += ui.day; counter = tally(dayItems.map((d) => ({ done: !!checks['db:' + d.id], counts: !d.notNeeded }))); }
  else { word = 'Done'; celebrateKey += ui.fList + ui.fDay; counter = tally(finalItems.map((f) => ({ done: !!checks[fKey(f)], counts: !f.notNeeded }))); }

  // celebration + counter
  const prev = useRef<{ key: string; complete: boolean }>({ key: '', complete: false });
  const [burst, setBurst] = useState(0);
  const complete = counter.total > 0 && counter.done === counter.total;
  useEffect(() => { if (prev.current.key === celebrateKey && !prev.current.complete && complete) setBurst((b) => b + 1); prev.current = { key: celebrateKey, complete }; }, [complete, celebrateKey]);
  const pct = counter.total ? (counter.done / counter.total) * 100 : 0;
  const lower = word.toLowerCase();
  const finalMsg = ui.fList === 'leave' ? 'Ready for Hong Kong!' : ui.fList === 'checkout' ? 'Hotel Checked — Ready to Fly Home!' : ui.fList === 'home' ? 'Welcome home!' : ui.fList === 'night' ? 'All set for tomorrow!' : 'All set — enjoy the day!';

  const visible = (done: boolean, nn: boolean) => (nn ? false : !((!ui.showPacked && done) || (ui.missingOnly && done)));
  const matchQ = (s: string) => !q.trim() || s.toLowerCase().includes(q.trim().toLowerCase());

  // ------------ panels ------------
  const shopPanel = () => {
    const f = ui.shopFilter;
    const base = shopItems.filter((i) => matchQ(i.name + ' ' + i.cat + ' ' + i.person) && (ui.cat === 'all' || i.cat === ui.cat));
    const inFilter = (i: Inv) => f === 'all' || (f === 'need' && i.shop === 'Need to Buy') || (f === 'have' && i.shop === 'Already Have') || (f === 'ordered' && BOUGHT.includes(i.shop)) || (f === 'nn' && isNN(i));
    const act = base.filter((i) => inFilter(i) && (f === 'nn' ? true : visible(ready(i), isNN(i))));
    const nn = base.filter((i) => isNN(i) && !ui.hideNN && f !== 'nn');
    const groups = visibleCats.map((c) => [c, act.filter((i) => i.cat === c)] as const).filter(([, l]) => l.length);
    const other = act.filter((i) => !visibleCats.includes(i.cat));
    if (other.length) groups.push(['Other', other] as never);
    const row = (i: Inv, muted = false) => (
      <Rowx key={i.id} muted={muted} title={i.name} onMenu={() => setMenu({ kind: 'inv', id: i.id, ctx: 'shop' })}
        lead={<button aria-label={`Status of ${i.name}: ${i.shop}`} onClick={() => setDlg({ type: 'status', id: i.id })} className="tap grid place-items-center"><span className={cx('h-4 w-4 rounded-full', SHOP_DOT[i.shop])} /></button>}
        sub={<>{i.shop}{i.qty > 1 ? ` · ×${i.qty}` : ''}{i.person !== 'Shared' ? ` · ${i.person}` : ''}{i.required ? '' : ' · optional'}{i.estCost ? ` · est ${fmtNative(i.estCost, i.currency, r)}` : ''}{i.actualCost ? ` · paid ${fmtNative(i.actualCost, i.currency, r)}` : ''}{i.notes ? ` · ${i.notes}` : ''}{i.taskId && <a href="#/more/ready" className="ml-1 font-bold text-sky">Travel Ready ›</a>}</>} />
    );
    return (
      <>
        <div className="mb-2 flex gap-2">
          <label className="relative flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" aria-label="Search items" className="w-full rounded-2xl border border-navy/15 bg-white py-2.5 pl-9 pr-3 text-[15px]" /></label>
          <Btn variant="soft" className="!px-3 text-[13px]" onClick={() => setDlg({ type: 'cats' })}>Categories</Btn>
        </div>
        <div className="mb-2"><Pills label="Category" value={ui.cat} onChange={(v) => setUI({ cat: v })} items={[['all', 'All categories'], ...visibleCats.map((c) => [c, c] as [string, string])]} /></div>
        {groups.length === 0 && <div className="card p-5 text-center text-[14px] text-muted">{counter.total === 0 ? '0 items · tap + Add Item' : 'Nothing matches these filters.'}</div>}
        {groups.map(([c, l]) => <Group key={c} id={c} title={c} done={l.filter(ready).length} total={l.length} force={ui.cat !== 'all' || !!q.trim()}>{l.map((i) => row(i))}</Group>)}
        {nn.length > 0 && <Group id="__nn" title="Not needed (muted)" done={0} total={nn.length}>{nn.map((i) => row(i, true))}</Group>}
      </>
    );
  };

  const clothesPanel = () => {
    const rows = clothes.filter((i) => matchQ(i.name));
    const done = (i: Inv) => itemDone(i);
    const f = ui.clothesFilter;
    const show = (i: Inv) => !isNN(i) && (f === 'packed' ? done(i) : f === 'unpacked' ? !done(i) : true) && visible(done(i), false);
    const act = rows.filter(show); const nn = rows.filter((i) => isNN(i) && !ui.hideNN);
    const row = (i: Inv, dayCtx?: number, muted = false) => (
      <Rowx key={i.id + (dayCtx ?? '')} muted={muted} checked={done(i)} onCheck={() => toggleItem(i)} title={i.name} thumb={vault.outfitDocs.some((d) => d.outfitId === i.id) ? <OutfitThumb docId={vault.outfitDocs.find((d) => d.outfitId === i.id)!.id} onOpen={() => setDlg({ type: 'photo', id: i.id })} /> : undefined} onMenu={() => setMenu({ kind: 'inv', id: i.id, ctx: 'clothes', dayCtx })}
        sub={<>{i.worn ? 'Worn during travel' : i.places.length ? `${packedQty(i)}/${i.qty} packed · ${i.places.map((p) => `${p.qty}× ${bagName(p.bag)}`).join(', ')}` : `×${i.qty} · no bag yet`}{i.required ? '' : ' · optional'}{i.notes ? ` · ${i.notes}` : ''}</>} />
    );
    const dayGroups: [string, Inv[]][] = [1, 2, 3, 4, 5].map((d) => [dayPill(d), act.filter((i) => i.days?.includes(d))] as [string, Inv[]]).filter(([, l]) => l.length);
    const spare = act.filter((i) => !i.days?.length);
    return (
      <>
        <div className="mb-2"><Pills label="Clothes filter" value={f} onChange={(v) => setUI({ clothesFilter: v })} items={[['all', 'All'], ['day', 'By Day'], ['unpacked', 'Unpacked'], ['packed', 'Packed']]} /></div>
        <label className="relative mb-2 block"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${ui.person}’s clothes`} aria-label="Search clothes" className="w-full rounded-2xl border border-navy/15 bg-white py-2.5 pl-9 pr-3 text-[15px]" /></label>
        {f === 'day' ? (
          <>
            {dayGroups.map(([t, l], k) => <Group key={t} id={'d' + k} title={t} done={l.filter(done).length} total={l.length} force>{l.map((i) => row(i, k + 1))}</Group>)}
            {spare.length > 0 && <Group id="spares" title="Spares & extras" done={spare.filter(done).length} total={spare.length} force>{spare.map((i) => row(i))}</Group>}
          </>
        ) : act.length ? <Group id={'all' + ui.person} title={`${ui.person}’s clothes`} done={act.filter(done).length} total={act.length} force>{act.map((i) => row(i))}</Group>
          : <div className="card p-5 text-center text-[14px] text-muted">{clothes.length === 0 ? '0 items · tap + Add Item' : 'Nothing matches these filters.'}</div>}
        {nn.length > 0 && <Group id="nn" title="Not needed (muted)" done={0} total={nn.length}>{nn.map((i) => row(i, undefined, true))}</Group>}
        <p className="px-1 text-[12px] text-muted">{ui.person === 'Keren' ? 'Modest outfits: below-knee skirts or dresses, relaxed fit, warm neutrals. ' : ''}Optional items count toward your total once you pack them. Change quantities any time — there is no “wrong” number.</p>
      </>
    );
  };

  const bagsPanel = () => {
    const b = bags.find((x) => x.id === ui.bag) ?? bags[0];
    const act = lines.filter((l) => matchQ(l.i.name) && !isNN(l.i) && visible(placeDone(l.p), false));
    const nn = lines.filter((l) => isNN(l.i) && !ui.hideNN);
    const groups: [string, typeof lines][] = [];
    for (const l of act) { const p = l.i.person === 'Shared' ? 'Shared' : l.i.person; const g = groups.find((x) => x[0] === p); g ? g[1].push(l) : groups.push([p, [l]]); }
    const over = b?.maxWeight && b?.actualWeight && b.actualWeight > b.maxWeight;
    const row = (l: (typeof lines)[number], muted = false) => (
      <Rowx key={l.i.id + l.pi} muted={muted} checked={placeDone(l.p)} onCheck={() => toggleLine(l.i, l.pi)} title={l.i.name} onMenu={() => setMenu({ kind: 'inv', id: l.i.id, ctx: 'bags', place: l.pi })}
        sub={<>×{l.p.qty}{l.p.qty !== l.i.qty ? ` of ${l.i.qty}` : ''} · {l.p.packed}/{l.p.qty} packed{l.i.places.length > 1 ? ` · also in ${l.i.places.filter((_, k) => k !== l.pi).map((p) => bagName(p.bag)).join(', ')}` : ''}{l.i.required ? '' : ' · optional'}</>} />
    );
    return (
      <>
        <button onClick={() => setDlg({ type: 'weights', id: b?.id })} className="card mb-3 block w-full p-3 text-left">
          <div className="flex items-center justify-between"><div className="text-[13px] font-bold text-navy">{b?.equipment ? 'Equipment (not checked baggage)' : 'Weight check'}</div><span className="text-[12px] font-bold text-sky">Edit</span></div>
          {!b?.equipment && <div className={cx('text-[14px]', over ? 'font-bold text-coral' : 'text-muted')}>{b?.actualWeight ? `${b.actualWeight} kg weighed` : 'Not weighed yet'}{b?.maxWeight ? ` · limit ${b.maxWeight} kg` : ' · no limit set'}{over ? ' — over the limit!' : ''}</div>}
          {b?.note && <div className="mt-1 text-[12px] text-muted">{b.note}</div>}
        </button>
        {groups.length === 0 && <div className="card p-5 text-center text-[14px] text-muted">{lines.length === 0 ? '0 items · tap + Add Item' : 'Nothing matches these filters.'}</div>}
        {groups.map(([p, l]) => <Group key={p} id={ui.bag + p} title={p === 'Shared' ? 'Shared' : p} done={l.filter((x) => placeDone(x.p)).length} total={l.length} force>{l.map((x) => row(x))}</Group>)}
        {nn.length > 0 && <Group id="nn" title="Not needed (muted)" done={0} total={nn.length}>{nn.map((l) => row(l, true))}</Group>}
      </>
    );
  };

  const daysPanel = () => {
    const act = dayItems.filter((d) => !d.notNeeded && matchQ(d.label) && visible(!!checks['db:' + d.id], false));
    const nn = dayItems.filter((d) => d.notNeeded && !ui.hideNN);
    const secs = [...new Set(dayItems.map((d) => d.section))];
    const row = (d: DayItem, muted = false) => <Rowx key={d.id} muted={muted} checked={!!checks['db:' + d.id]} onCheck={() => toggle('db:' + d.id)} title={d.label} sub={d.notes} onMenu={() => setMenu({ kind: 'day', id: d.id, ctx: 'other' })} />;
    return (
      <>
        <div className="mb-2 flex items-center gap-2 text-[13px] text-muted"><span className="flex-1 font-bold text-navy">{DAYS[ui.day - 1].title}</span><a className="font-bold text-sky" href={'#/itinerary/' + ui.day}>Open Day {ui.day} ›</a></div>
        {act.length === 0 && <div className="card p-5 text-center text-[14px] text-muted">{dayItems.length === 0 ? '0 items · tap + Add Item' : 'Nothing left with these filters.'}</div>}
        {secs.map((s) => { const l = act.filter((d) => d.section === s); const all = dayItems.filter((d) => d.section === s && !d.notNeeded); return l.length ? <Group key={s} id={`${ui.day}-${s}`} title={s} done={all.filter((d) => checks['db:' + d.id]).length} total={all.length}>{l.map((d) => row(d))}</Group> : null; })}
        {nn.length > 0 && <Group id={`${ui.day}-nn`} title="Not needed (muted)" done={0} total={nn.length}>{nn.map((d) => row(d, true))}</Group>}
      </>
    );
  };

  const finalPanel = () => {
    const act = finalItems.filter((f) => !f.notNeeded && matchQ(f.label) && visible(!!checks[fKey(f)], false));
    const nn = finalItems.filter((f) => f.notNeeded && !ui.hideNN);
    const secs = [...new Set(finalItems.map((f) => f.section))];
    const row = (f: FinalItem, muted = false) => <Rowx key={f.id} muted={muted} checked={!!checks[fKey(f)]} onCheck={() => toggle(fKey(f))} title={f.label} onMenu={() => setMenu({ kind: 'final', id: f.id, ctx: 'other' })} />;
    return (
      <>
        {fDays.length > 0 && <div className="mb-2"><Pills label="Day" value={ui.fDay} onChange={(v) => setUI({ fDay: v })} items={fDays.map((d) => [d, ui.fList === 'night' ? `Night of ${dateLabel(DAYS[d - 1].date, { day: 'numeric', month: 'short' })}` : dayPill(d)] as [number, string])} /></div>}
        {ui.fList === 'night' && <p className="mb-2 px-1 text-[12px] text-muted">Quick prep for <b>{dateLabel(DAYS[Math.min(4, ui.fDay)].date, { weekday: 'long', day: 'numeric', month: 'short' })}</b>.{ui.fDay === 4 && <> This is also the night to start the <button className="font-bold text-sky underline" onClick={() => setUI({ fList: 'checkout' })}>Hotel Checkout list</button>.</>}</p>}
        {complete && <div className="mb-3 rounded-2xl bg-turq-soft px-4 py-3 text-center text-[16px] font-bold text-[#0b6b61]">🎉 {finalMsg}</div>}
        {act.length === 0 && <div className="card p-5 text-center text-[14px] text-muted">{finalItems.length === 0 ? '0 items · tap + Add Item' : 'Nothing left with these filters.'}</div>}
        {secs.map((s) => { const l = act.filter((f) => f.section === s); const all = finalItems.filter((f) => f.section === s && !f.notNeeded); return l.length ? <Group key={s} id={`${ui.fList}-${s}`} title={s} done={all.filter((f) => checks[fKey(f)]).length} total={all.length}>{l.map((f) => row(f))}</Group> : null; })}
        {nn.length > 0 && <Group id={`${ui.fList}-nn`} title="Not needed (muted)" done={0} total={nn.length}>{nn.map((f) => row(f, true))}</Group>}
      </>
    );
  };

  // ------------ menus & dialogs ------------
  const menuInv = menu?.kind === 'inv' ? getInv(menu.id) : undefined;
  const menuDay = menu?.kind === 'day' ? dayC.items.find((d) => d.id === menu.id) : undefined;
  const menuFin = menu?.kind === 'final' ? finC.items.find((f) => f.id === menu.id) : undefined;
  const addDefaultsTitle = ui.tab === 'shop' ? 'Add item' : ui.tab === 'clothes' ? `Add to ${ui.person}’s clothes` : ui.tab === 'bags' ? `Add to ${bagName(ui.bag)}` : ui.tab === 'days' ? `Add to Day ${ui.day}` : 'Add check';

  const P: PackApi = { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, setMenu, getInv, upd, changeShop, expCat, vault, visibleCats, cats, dayItems, finalItems, addDefaultsTitle };

  return (
    <PackCtx.Provider value={P}>
    <div className="pb-4">
      <Confetti burst={burst} />
      {/* sticky compact header */}
      <div className="sticky top-0 z-20 -mx-4 space-y-2 border-b border-navy/5 bg-paper/95 px-4 pb-2 pt-[calc(var(--safe-t)+8px)] backdrop-blur">
        <div className="flex items-center gap-1">
          <a href="#/more" aria-label="Back" className="tap -ml-2 grid place-items-center text-navy"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M15 5l-7 7 7 7" /></svg></a>
          <h1 className="flex-1 text-[22px] font-bold text-navy">Packing</h1>
          <button aria-label="View options" onClick={() => setDlg({ type: 'view' })} className="tap relative grid place-items-center text-navy"><SlidersHorizontal size={21} />{(!ui.showPacked || !ui.hideNN || ui.missingOnly) && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral" />}</button>
          <Btn variant="primary" className="!min-h-[42px] !px-3 !py-1.5 text-[14px]" icon={<Plus size={17} />} onClick={() => setDlg({ type: 'add' })}>Add Item</Btn>
        </div>
        <Pills label="Packing sections" value={ui.tab} onChange={(v) => setUI({ tab: v })} items={TABS} />
        {ui.tab === 'clothes' && <Pills label="Person" value={ui.person} onChange={(v) => setUI({ person: v })} items={(['Keren', 'Gilbert', 'Aya'] as const).map((p) => [p, p] as ['Keren' | 'Gilbert' | 'Aya', string])} />}
        {ui.tab === 'shop' && <Pills label="Shopping filter" value={ui.shopFilter} onChange={(v) => setUI({ shopFilter: v })} items={[['all', 'All'], ['need', 'Need to Buy'], ['have', 'Already Have'], ['ordered', 'Ordered & Received'], ['nn', 'Not Needed']]} />}
        {ui.tab === 'bags' && <Pills label="Bag" value={ui.bag} onChange={(v) => setUI({ bag: v })} items={[...bags.map((b) => [b.id, b.name] as [string, string]), ['__manage', '⚙ Manage']]} />}
        {ui.tab === 'days' && <Pills label="Day" value={ui.day} onChange={(v) => setUI({ day: v })} items={[1, 2, 3, 4, 5].map((d) => [d, dayPill(d)] as [number, string])} />}
        {ui.tab === 'final' && <Pills label="Checklist" value={ui.fList} onChange={(v) => setUI({ fList: v, fDay: v === 'night' ? Math.min(ui.fDay, 4) : v === 'morning' ? Math.max(2, Math.min(ui.fDay, 4)) : ui.fDay })} items={FLISTS} />}
        {/* live counter */}
        <div role="status" aria-live="polite">
          <div className="flex items-center justify-between text-[14px] font-bold">
            {counter.total === 0 ? <button className="text-sky" onClick={() => setDlg({ type: 'add' })}>0 items · Add item</button>
              : <span className={complete ? 'text-[#0b6b61]' : 'text-navy'}>{counter.done}/{counter.total} {word} · {complete ? `All ${lower}!` : `${counter.total - counter.done} remaining`}</span>}
            {ui.tab === 'bags' && ui.bag === '__manage' ? null : null}
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-navy/10"><motion.div className={cx('h-full rounded-full', complete ? 'bg-turq' : 'bg-sky')} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} /></div>
        </div>
      </div>

      <div className="pt-3">
        {ui.tab === 'shop' && shopPanel()}{ui.tab === 'clothes' && clothesPanel()}{ui.tab === 'bags' && bagsPanel()}{ui.tab === 'days' && daysPanel()}{ui.tab === 'final' && finalPanel()}
      </div>

      {/* toast with Undo */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-4 bottom-[calc(84px+var(--safe-b))] z-40 mx-auto flex max-w-[520px] items-center gap-3 rounded-2xl bg-navy px-4 py-3 text-[14px] font-bold text-white shadow-xl" role="status">
            <span className="flex-1">{toast.msg}</span>{toast.undo && <button onClick={toast.undo} className="tap flex items-center gap-1 text-sun"><Undo2 size={16} />Undo</button>}<button aria-label="Dismiss" onClick={() => setToast(null)} className="text-white/60"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* three-dot menu */}
      <Sheet open={!!menu && !!(menuInv || menuDay || menuFin)} onClose={() => setMenu(null)} title={menuInv?.name ?? menuDay?.label ?? menuFin?.label ?? 'Options'}>
        {menu && menuInv && (() => { const i = menuInv; return (
          <div className="pb-2">
            <A icon="✏️" label="Edit" onClick={() => setDlg({ type: 'edit', id: i.id })} />
            <A icon="🔢" label="Change Qty" onClick={() => setDlg({ type: 'qty', id: i.id })} />
            {i.group === 'clothes' && <A icon={<Camera size={18} />} label={vault.outfitDocs.some((d) => d.outfitId === i.id) ? 'Outfit photo' : 'Add outfit photo'} onClick={() => setDlg({ type: 'photo', id: i.id })} />}
            <A icon="🙋" label="Assign Person" onClick={() => setDlg({ type: 'person', id: i.id })} />
            <A icon="🧳" label="Move Bag" onClick={() => setDlg({ type: 'qty', id: i.id })} />
            <A icon="📅" label="Change Day" onClick={() => setDlg({ type: 'days', id: i.id })} />
            <A icon={<Copy size={18} />} label="Duplicate" onClick={() => duplicate(i)} />
            {isNN(i) ? <A icon="↩️" label="Restore (needed again)" onClick={() => { setNN(i, false); say('Restored'); }} /> : <A icon="🚫" label="Not Needed" onClick={() => { setNN(i, true); say('Marked Not Needed', () => { setNN(i, false); setToast(null); }); }} />}
            <A icon="➖" label="Remove from This List" onClick={() => {
              if (menu.ctx === 'bags' && menu.place !== undefined) upd(i.id, { places: i.places.filter((_, k) => k !== menu.place) });
              else if (menu.ctx === 'clothes' && menu.dayCtx) upd(i.id, { days: (i.days ?? []).filter((d) => d !== menu.dayCtx) });
              else if (menu.ctx === 'clothes') upd(i.id, { group: 'general', shopListed: true });
              else upd(i.id, { shopListed: false });
              say('Removed from this list (still in your inventory)');
            }} />
            <A icon={<Trash2 size={18} />} label="Delete Item" danger onClick={() => deleteInv(i)} />
          </div>); })()}
        {menu && menuDay && (
          <div className="pb-2">
            <A icon="✏️" label="Edit" onClick={() => setDlg({ type: 'editLite', id: menuDay.id })} />
            <A icon={<Copy size={18} />} label="Duplicate" onClick={() => { dayC.add({ ...menuDay, id: uid(), label: menuDay.label + ' (copy)' }); say('Duplicated'); }} />
            {[1, 2, 3, 4, 5].filter((d) => d !== menuDay.day).slice(0, 0).map(() => null)}
            <A icon="🚫" label={menuDay.notNeeded ? 'Restore (needed again)' : 'Not Needed'} onClick={() => dayC.update(menuDay.id, { notNeeded: !menuDay.notNeeded })} />
            <A icon="➖" label="Remove from This List" onClick={() => { const it = menuDay; const seed = dayC.isSeed(it.id); dayC.remove(it.id); say('Removed from this day', () => { if (seed) dayC.restore(it.id); else dayC.add({ ...it, id: uid() }); setToast(null); }); }} />
          </div>
        )}
        {menu && menuFin && (
          <div className="pb-2">
            <A icon="✏️" label="Edit" onClick={() => setDlg({ type: 'editLite', id: menuFin.id })} />
            <A icon={<Copy size={18} />} label="Duplicate" onClick={() => { finC.add({ ...menuFin, id: uid(), label: menuFin.label + ' (copy)' }); say('Duplicated'); }} />
            <A icon="🚫" label={menuFin.notNeeded ? 'Restore (needed again)' : 'Not Needed'} onClick={() => finC.update(menuFin.id, { notNeeded: !menuFin.notNeeded })} />
            <A icon="➖" label="Remove from This List" onClick={() => { const it = menuFin; const seed = finC.isSeed(it.id); finC.remove(it.id); say('Removed', () => { if (seed) finC.restore(it.id); else finC.add({ ...it, id: uid() }); setToast(null); }); }} />
          </div>
        )}
      </Sheet>

      {/* dialogs */}
      <Dialogs />
    </div>
    </PackCtx.Provider>
  );
}

function invFields(cats: string[]): Field[] {
  return [
    { key: 'name', label: 'Name', type: 'text' }, { key: 'notes', label: 'Notes', type: 'textarea' },
    { key: 'qty', label: 'Quantity needed', type: 'number' },
    { key: 'person', label: 'Person', type: 'select', options: PEOPLE.map((p) => ({ value: p, label: p })) },
    { key: 'cat', label: 'Category', type: 'select', options: cats.map((c) => ({ value: c, label: c })) },
    { key: 'required', label: 'Required or optional', type: 'select', options: [{ value: 'req', label: 'Required' }, { value: 'opt', label: 'Optional' }] },
    { key: 'priority', label: 'Priority', type: 'select', options: [{ value: 'high', label: 'High' }, { value: 'normal', label: 'Normal' }, { value: 'low', label: 'Low' }] },
    { key: 'shop', label: 'Shopping status', type: 'select', options: SHOP_STATUSES.map((s) => ({ value: s, label: s })) },
    { key: 'estCost', label: 'Estimated cost (not spent)', type: 'number' }, { key: 'actualCost', label: 'Actual price paid', type: 'number' },
    { key: 'currency', label: 'Currency', type: 'select', options: [{ value: 'PHP', label: '₱ (PHP)' }, { value: 'HKD', label: 'HK$ (HKD)' }] },
    { key: 'purchaseDate', label: 'Purchase date', type: 'date' }, { key: 'source', label: 'Store / link', type: 'text' }, { key: 'receipt', label: 'Receipt reference', type: 'text' },
  ];
}
const invValues = (i: Inv) => ({ name: i.name, notes: i.notes ?? '', qty: i.qty, person: i.person, cat: i.cat, required: i.required ? 'req' : 'opt', priority: i.priority, shop: i.shop, estCost: i.estCost ?? null, actualCost: i.actualCost ?? null, currency: i.currency, purchaseDate: i.purchaseDate ?? '', source: i.source ?? '', receipt: i.receipt ?? '' });
function fromValues(v: Record<string, string | number | null | undefined>, i: Inv): Partial<Inv> {
  const shop = String(v.shop) as ShopStatus;
  const qty = Math.max(1, Number(v.qty) || 1);
  const places = i.places.length === 1 ? [{ ...i.places[0], qty, packed: Math.min(i.places[0].packed, qty) }] : i.places;
  return {
    name: String(v.name || i.name), notes: String(v.notes ?? ''), qty, places, person: v.person as Person, cat: String(v.cat), required: v.required !== 'opt', priority: v.priority as Inv['priority'],
    shop, notNeeded: shop === 'Not Needed' ? true : i.notNeeded && i.shop !== 'Not Needed' ? true : false, estCost: v.estCost as number | null, actualCost: v.actualCost as number | null, currency: v.currency as 'PHP' | 'HKD',
    purchaseDate: String(v.purchaseDate ?? ''), source: String(v.source ?? ''), receipt: String(v.receipt ?? ''),
  };
}
void go;

const Rowx = ({ checked, onCheck, title, sub, right, muted, onMenu, checkLabel, lead, thumb }: { checked?: boolean; onCheck?: () => void; title: string; sub?: ReactNode; right?: ReactNode; muted?: boolean; onMenu: () => void; checkLabel?: string; lead?: ReactNode; thumb?: ReactNode }) => (
  <div className={cx('flex items-center gap-2 px-3 py-1.5', muted && 'opacity-60')}>
    {lead ?? <button aria-label={checkLabel ?? title} aria-pressed={!!checked} onClick={onCheck} className="tap grid place-items-center"><span className={cx('grid h-7 w-7 place-items-center rounded-lg border-2 transition-colors', checked ? 'border-turq bg-turq text-white' : 'border-navy/30 bg-white')}>{checked && <svg viewBox="0 0 16 16" className="h-4 w-4"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span></button>}
    {thumb}
    <div className="min-w-0 flex-1 py-1"><div className={cx('text-[15px] font-bold leading-snug text-navy', checked && 'text-muted line-through')}>{title}</div>{sub && <div className="text-[12px] leading-snug text-muted">{sub}</div>}</div>
    {right}
    <button aria-label={`Options for ${title}`} onClick={onMenu} className="tap grid place-items-center text-muted"><MoreVertical size={20} /></button>
  </div>
);
const Group = ({ id, title, done, total, children, force }: { id: string; title: string; done: number; total: number; children: ReactNode; force?: boolean }) => {
  const { ui, setUI } = usePack();
  const key = `${ui.tab}:${id}`; const open = force || (ui.open[key] ?? total <= 8);
  return (
    <div className="card mb-3 overflow-hidden">
      <button className="flex w-full items-center gap-2 px-4 py-3 text-left" aria-expanded={open} onClick={() => setUI({ open: { ...ui.open, [key]: !open } })}>
        <span className="flex-1 text-[15px] font-bold text-navy">{title}</span><span className="text-[12px] font-bold text-muted">{done}/{total}</span><ChevronDown size={18} className={cx('text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="divide-y divide-navy/5 border-t border-navy/5">{children}</div>}
    </div>
  );
};
const Pills = <T extends string | number>({ items, value, onChange, label }: { items: [T, string][]; value: T; onChange: (v: T) => void; label: string }) => (
  <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 scroll-hide" role="tablist" aria-label={label}>
    {items.map(([k, l]) => <button key={String(k)} role="tab" aria-selected={k === value} onClick={() => onChange(k)} className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold', k === value ? 'bg-navy text-white' : 'bg-white text-navy shadow-sm')}>{l}</button>)}
  </div>
);


const A = ({ icon, label, onClick, danger }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) => {
  const { setMenu } = usePack();
  return (
  <button onClick={() => { setMenu(null); onClick(); }} className={cx('tap flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-[16px] font-bold active:bg-paper', danger ? 'text-[#a63a2b]' : 'text-navy')}><span className="w-6 text-center">{icon}</span>{label}</button>
);
};

function Dialogs() {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const it = getInv(dlg?.id);
  const close = () => setDlg(null);
  return (
    <>
      <EditSheet open={dlg?.type === 'edit' && !!it} onClose={close} title="Edit item" fields={invFields(visibleCats)} values={it ? invValues(it) : {}}
        onSave={(v) => { if (!it) return; const next = fromValues(v, it); upd(it.id, next); if (next.shop && next.shop !== it.shop && BOUGHT.includes(next.shop) && !BOUGHT.includes(it.shop) && !it.expenseId) setTimeout(() => setDlg({ type: 'expense', id: it.id }), 50); }} />
      <EditSheet open={dlg?.type === 'editLite'} onClose={close} title="Edit" fields={[{ key: 'label', label: 'Name', type: 'text' }, { key: 'notes', label: 'Notes', type: 'text' }]}
        values={(() => { const d = dayC.items.find((x) => x.id === dlg?.id); const f = finC.items.find((x) => x.id === dlg?.id); return { label: d?.label ?? f?.label ?? '', notes: d?.notes ?? '' }; })()}
        onSave={(v) => { if (dayC.items.some((x) => x.id === dlg?.id)) dayC.update(dlg!.id!, { label: String(v.label), notes: String(v.notes ?? '') }); else if (dlg?.id) finC.update(dlg.id, { label: String(v.label) }); }} />
      <AddDialog open={dlg?.type === 'add'} onClose={close} />
      <QtyDialog open={dlg?.type === 'qty' && !!it} onClose={close} item={it} />
      <Sheet open={dlg?.type === 'person' && !!it} onClose={close} title="Assign person"><div className="space-y-2 pb-2 pt-1">{PEOPLE.map((p) => <Btn key={p} variant={it?.person === p ? 'primary' : 'soft'} className="w-full" onClick={() => { it && upd(it.id, { person: p }); close(); }}>{p}</Btn>)}</div></Sheet>
      <DaysDialog open={dlg?.type === 'days' && !!it} onClose={close} item={it} />
      <Sheet open={dlg?.type === 'status' && !!it} onClose={close} title={it ? `Status · ${it.name}` : 'Status'}><div className="space-y-1.5 pb-2 pt-1">{SHOP_STATUSES.map((s) => <Btn key={s} variant={it?.shop === s ? 'primary' : 'soft'} className="w-full justify-start" onClick={() => { const cur = it; close(); if (cur) setTimeout(() => changeShop(cur, s), 50); }}><span className={cx('mr-1 h-3 w-3 rounded-full', SHOP_DOT[s])} />{s}</Btn>)}</div></Sheet>
      <ExpenseDialog open={dlg?.type === 'expense' && !!it} onClose={close} item={it} />
      <CatsDialog open={dlg?.type === 'cats'} onClose={close} />
      <Sheet open={dlg?.type === 'view'} onClose={close} title="View options"><div className="space-y-4 pb-2 pt-1">
        {([['showPacked', 'Show packed items', 'Off hides finished rows. Your progress count stays correct.'], ['hideNN', 'Hide “Not Needed” items', 'Off shows them in a muted section where you can restore them.'], ['missingOnly', 'Missing only', 'Only items that are not packed / ready yet.']] as const).map(([k, t, d]) => (
          <div key={k} className="flex items-center gap-3"><div className="flex-1"><div className="font-bold text-navy">{t}</div><div className="text-[13px] text-muted">{d}</div></div><Toggle label={t} on={ui[k]} onChange={(v) => setUI({ [k]: v } as Partial<PackUI>)} /></div>))}
        <p className="flex gap-2 text-[12px] text-muted"><Eye size={14} className="mt-0.5 shrink-0" />Filters change what you see, never the totals.</p></div></Sheet>
      <BagsDialog open={dlg?.type === 'bags' || ui.bag === '__manage'} onClose={() => { close(); if (ui.bag === '__manage') setUI({ bag: bags[0]?.id ?? 'main' }); }} />
      <WeightsDialog open={dlg?.type === 'weights'} onClose={close} />
      <PhotoDialog open={dlg?.type === 'photo' && !!it} onClose={close} item={it} />
    </>
  );
}

function AddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const isInv = ui.tab === 'shop' || ui.tab === 'clothes' || ui.tab === 'bags';
  const fields: Field[] = isInv
    ? [{ key: 'name', label: 'Item', type: 'text' }, { key: 'qty', label: 'Quantity', type: 'number' }, ...(ui.tab === 'shop' ? [{ key: 'cat', label: 'Category', type: 'select' as const, options: visibleCats.map((c) => ({ value: c, label: c })) }, { key: 'person', label: 'For', type: 'select' as const, options: PEOPLE.map((p) => ({ value: p, label: p })) }] : [])]
    : [{ key: 'name', label: 'What', type: 'text' }, { key: 'section', label: 'Section', type: 'text', hint: 'For example “Everyday” or a new group name.' }];
  return (
    <EditSheet open={open} onClose={onClose} title={addDefaultsTitle} saveLabel="Add" fields={fields}
      values={{ name: '', qty: 1, cat: ui.cat !== 'all' ? ui.cat : visibleCats[0], person: 'Shared', section: ui.tab === 'days' ? dayItems[0]?.section ?? 'Everyday' : finalItems[0]?.section ?? 'Extra' }}
      onSave={(v) => {
        const name = String(v.name || '').trim(); if (!name) return;
        if (ui.tab === 'days') return void dayC.add({ id: uid(), day: ui.day, section: String(v.section || 'Extra'), label: name });
        if (ui.tab === 'final') return void finC.add({ id: uid(), list: ui.fList, section: String(v.section || 'Extra'), label: name });
        const qty = Math.max(1, Number(v.qty) || 1);
        const base: Inv = { id: uid(), name, qty, cat: String(v.cat || 'Other'), person: (ui.tab === 'clothes' ? ui.person : (v.person as Person) || 'Shared'), required: true, priority: 'normal', group: ui.tab === 'clothes' ? 'clothes' : 'general', shop: 'Not Reviewed', currency: 'PHP', places: [], shopListed: ui.tab !== 'clothes' };
        if (ui.tab === 'clothes') base.places = [{ bag: 'main', qty, packed: 0 }];
        if (ui.tab === 'bags') base.places = [{ bag: ui.bag, qty, packed: 0 }];
        inv.add(base); say('Added');
      }} />
  );
}

function QtyDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: Inv }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const [rows, setRows] = useState<Place[]>([]); const [total, setTotal] = useState(1);
  useEffect(() => { if (open && item) { setRows(item.places.map((p) => ({ ...p }))); setTotal(item.qty); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const sum = rows.reduce((n, p) => n + (Number(p.qty) || 0), 0);
  return (
    <Sheet open={open} onClose={onClose} title="Quantity & bags">
      <div className="space-y-3 pb-2 pt-1">
        <p className="text-[13px] text-muted">One physical item can be split across bags (for example 2 in Aya’s backpack and 2 in the checked bag). It is never counted twice.</p>
        {rows.length === 0 && <label className="block text-[14px] font-bold text-navy">Total quantity<input type="number" min={1} className={input + ' mt-1 font-normal'} value={total} onChange={(e) => setTotal(Number(e.target.value))} /></label>}
        {rows.map((p, k) => (
          <div key={k} className="grid grid-cols-[1fr_72px_72px_36px] items-end gap-2">
            <label className="text-[12px] font-bold text-muted">Bag<select className={input + ' !px-2 !py-2.5 text-[14px] font-normal'} value={p.bag} onChange={(e) => setRows(rows.map((x, j) => (j === k ? { ...x, bag: e.target.value } : x)))}>{bags.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
            <label className="text-[12px] font-bold text-muted">Qty<input type="number" min={0} className={input + ' !px-2 !py-2.5 text-[14px] font-normal'} value={p.qty} onChange={(e) => setRows(rows.map((x, j) => (j === k ? { ...x, qty: Number(e.target.value) } : x)))} /></label>
            <label className="text-[12px] font-bold text-muted">Packed<input type="number" min={0} className={input + ' !px-2 !py-2.5 text-[14px] font-normal'} value={p.packed} onChange={(e) => setRows(rows.map((x, j) => (j === k ? { ...x, packed: Number(e.target.value) } : x)))} /></label>
            <button aria-label="Remove this bag line" onClick={() => setRows(rows.filter((_, j) => j !== k))} className="tap grid place-items-center text-muted"><X size={18} /></button>
          </div>
        ))}
        <Btn variant="ghost" className="w-full" icon={<Plus size={16} />} onClick={() => setRows([...rows, { bag: bags[0]?.id ?? 'main', qty: 1, packed: 0 }])}>Add bag / split</Btn>
        {rows.length > 0 && <p className="text-[13px] font-bold text-navy">Total: {sum}</p>}
        <Btn className="w-full" onClick={() => { if (!item) return; const clean = rows.filter((p) => p.qty > 0).map((p) => ({ ...p, packed: Math.min(Math.max(0, Number(p.packed) || 0), p.qty) })); upd(item.id, { places: clean, qty: clean.length ? clean.reduce((n, p) => n + p.qty, 0) : Math.max(1, total) }); onClose(); }}>Save</Btn>
      </div>
    </Sheet>
  );
}

function DaysDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: Inv }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const [d, setD] = useState<number[]>([]);
  useEffect(() => { if (open && item) setD(item.days ?? []); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Sheet open={open} onClose={onClose} title="Change day">
      <div className="space-y-2 pb-2 pt-1">
        {[1, 2, 3, 4, 5].map((n) => <button key={n} aria-pressed={d.includes(n)} onClick={() => setD(d.includes(n) ? d.filter((x) => x !== n) : [...d, n].sort())} className={cx('tap flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-[15px] font-bold', d.includes(n) ? 'bg-navy text-white' : 'bg-sky-soft text-navy')}>{dayPill(n)}<span>{d.includes(n) ? '✓' : ''}</span></button>)}
        <p className="text-[12px] text-muted">Pick no day to keep it as a spare / extra.</p>
        <Btn className="w-full" onClick={() => { item && upd(item.id, { days: d }); onClose(); }}>Save</Btn>
      </div>
    </Sheet>
  );
}

function ExpenseDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: Inv }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const [amt, setAmt] = useState(''); const [cur, setCur] = useState<'PHP' | 'HKD'>('PHP'); const [link, setLink] = useState('');
  useEffect(() => { if (open && item) { setAmt(item.actualCost ? String(item.actualCost) : ''); setCur(item.currency); setLink(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const spendable = exps.items.filter((e) => e.kind === 'spend');
  return (
    <Sheet open={open} onClose={onClose} title="Record expense?">
      <div className="space-y-3 pb-2 pt-1">
        <p className="text-[14px] text-muted">“{item?.name}” is {item?.shop.toLowerCase()}. Estimated cost never counts as spent — enter what you actually paid, or link an expense you already added so nothing is counted twice.</p>
        <div className="grid grid-cols-[1fr_110px] gap-2"><input type="number" inputMode="decimal" placeholder="Amount actually paid" className={input} value={amt} onChange={(e) => setAmt(e.target.value)} /><select className={input} value={cur} onChange={(e) => setCur(e.target.value as 'PHP' | 'HKD')}><option value="PHP">₱ PHP</option><option value="HKD">HK$ HKD</option></select></div>
        <Btn className="w-full" disabled={!(Number(amt) > 0)} onClick={() => { if (!item) return; const id = uid(); exps.add({ id, label: item.name, category: expCat(item), amount: Number(amt), currency: cur, status: 'paid', kind: 'spend', note: 'From packing list' }); upd(item.id, { expenseId: id, actualCost: Number(amt), currency: cur }); say('Expense added'); onClose(); }}>Add New expense</Btn>
        <div className="space-y-2"><select className={input} value={link} onChange={(e) => setLink(e.target.value)}><option value="">Link an existing expense…</option>{spendable.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}</select><Btn variant="soft" className="w-full" disabled={!link} onClick={() => { item && upd(item.id, { expenseId: link }); say('Linked — no new expense added'); onClose(); }}>Link Existing</Btn></div>
        <Btn variant="ghost" className="w-full" onClick={onClose}>Not Now</Btn>
      </div>
    </Sheet>
  );
}

function CatsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { inv, ui, setUI, cats, upd } = usePack();
  const moveCat = (c: string, dir: -1 | 1) => { const order = [...cats]; const k = order.indexOf(c); const j = k + dir; if (j < 0 || j >= order.length) return; [order[k], order[j]] = [order[j], order[k]]; setUI({ catOrder: order }); };
  return (
    <Sheet open={open} onClose={onClose} title="Categories">
      <div className="space-y-2 pb-2 pt-1">
        {cats.map((c, k) => { const n = inv.items.filter((i) => i.cat === c).length; const hidden = (ui.hiddenCats ?? []).includes(c); return (
          <div key={c} className={cx('flex items-center gap-2 rounded-2xl bg-paper px-3 py-2', hidden && 'opacity-60')}>
            <span className="min-w-0 flex-1 text-[14px] font-bold text-navy">{c} <span className="font-normal text-muted">({n})</span></span>
            <button aria-label={`Move ${c} up`} disabled={k === 0} onClick={() => moveCat(c, -1)} className="tap px-1 text-muted disabled:opacity-30">↑</button><button aria-label={`Move ${c} down`} disabled={k === cats.length - 1} onClick={() => moveCat(c, 1)} className="tap px-1 text-muted disabled:opacity-30">↓</button>
            <button className="tap px-2 text-[13px] font-bold text-sky" onClick={() => { const nn = prompt('Rename category', c)?.trim(); if (nn && nn !== c) { inv.items.filter((i) => i.cat === c).forEach((i) => upd(i.id, { cat: nn })); setUI({ catOrder: (ui.catOrder ?? []).map((x) => (x === c ? nn : x)), extraCats: [...(ui.extraCats ?? []).filter((x) => x !== c), nn], hiddenCats: (ui.hiddenCats ?? []).map((h) => (h === c ? nn : h)), cat: ui.cat === c ? 'all' : ui.cat }); } }}>Rename</button>
            <button className="tap px-2 text-[13px] font-bold text-sky" onClick={() => setUI({ hiddenCats: hidden ? (ui.hiddenCats ?? []).filter((h) => h !== c) : [...(ui.hiddenCats ?? []), c] })}>{hidden ? 'Show' : 'Hide'}</button>
            {n === 0 && <button aria-label={`Delete ${c}`} className="tap text-coral" onClick={() => setUI({ extraCats: (ui.extraCats ?? []).filter((x) => x !== c), hiddenCats: [...(ui.hiddenCats ?? []), c] })}><Trash2 size={16} /></button>}
          </div>); })}
        <Btn variant="soft" className="w-full" icon={<Plus size={16} />} onClick={() => { const nn = prompt('New category name')?.trim(); if (nn) setUI({ extraCats: [...(ui.extraCats ?? []), nn] }); }}>Add category</Btn>
        <p className="text-[12px] text-muted">Hiding a category never deletes its items.</p>
      </div>
    </Sheet>
  );
}

function BagsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const [removing, setRemoving] = useState<string | null>(null); const [target, setTarget] = useState('');
  const count = (id: string) => inv.items.reduce((n, i) => n + i.places.filter((p) => p.bag === id).length, 0);
  const move = (b: Bag, dir: -1 | 1) => { const s = [...bags]; const k = s.findIndex((x) => x.id === b.id); const o = s[k + dir]; if (!o) return; bagsC.update(b.id, { order: o.order }); bagsC.update(o.id, { order: b.order }); };
  return (
    <Sheet open={open} onClose={onClose} title="Manage bags">
      <div className="space-y-2 pb-2 pt-1">
        {bags.map((b, k) => (
          <div key={b.id} className="rounded-2xl bg-paper px-3 py-2">
            <div className="flex items-center gap-1"><span className="min-w-0 flex-1 text-[14px] font-bold text-navy">{b.name} <span className="font-normal text-muted">({count(b.id)})</span></span>
              <button aria-label="Move up" disabled={k === 0} onClick={() => move(b, -1)} className="tap px-1 text-muted disabled:opacity-30">↑</button><button aria-label="Move down" disabled={k === bags.length - 1} onClick={() => move(b, 1)} className="tap px-1 text-muted disabled:opacity-30">↓</button>
              <button className="tap px-2 text-[13px] font-bold text-sky" onClick={() => { const nn = prompt('Rename bag', b.name)?.trim(); if (nn) bagsC.update(b.id, { name: nn }); }}>Rename</button>
              <button className="tap px-2 text-[13px] font-bold text-coral" onClick={() => { setRemoving(b.id); setTarget(bags.find((x) => x.id !== b.id)?.id ?? ''); }}>Remove</button></div>
            {removing === b.id && (
              <div className="mt-2 space-y-2 border-t border-navy/10 pt-2">
                <p className="text-[13px] text-muted">{count(b.id) ? `${count(b.id)} item line(s) are in this bag. Move them first:` : 'This bag is empty.'}</p>
                {count(b.id) > 0 && <select className={input} value={target} onChange={(e) => setTarget(e.target.value)}>{bags.filter((x) => x.id !== b.id).map((x) => <option key={x.id} value={x.id}>Move to {x.name}</option>)}</select>}
                <div className="flex gap-2"><Btn variant="ghost" className="flex-1" onClick={() => setRemoving(null)}>Cancel</Btn><Btn variant="danger" className="flex-1" onClick={() => { inv.items.filter((i) => i.places.some((p) => p.bag === b.id)).forEach((i) => upd(i.id, { places: i.places.map((p) => (p.bag === b.id ? { ...p, bag: target } : p)) })); bagsC.remove(b.id); setRemoving(null); setUI({ bag: target || 'main' }); }}>Remove bag</Btn></div>
              </div>)}
          </div>))}
        <Btn variant="soft" className="w-full" icon={<Plus size={16} />} onClick={() => { const nn = prompt('New bag name')?.trim(); if (nn) bagsC.add({ id: uid(), name: nn, order: Math.max(0, ...bags.map((b) => b.order)) + 1, maxWeight: null, actualWeight: null }); }}>Add bag</Btn>
      </div>
    </Sheet>
  );
}

function WeightsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { inv, bagsC, dayC, finC, exps, bags, bagName, ui, setUI, say, setToast, dlg, setDlg, getInv, upd, changeShop, expCat, visibleCats, cats, dayItems, finalItems, addDefaultsTitle, vault } = usePack();
  const b = bags.find((x) => x.id === ui.bag);
  return (
    <EditSheet open={open} onClose={onClose} title={b ? `${b.name} — weight` : 'Weight'} fields={[{ key: 'maxWeight', label: 'Weight limit (kg) — from your airline rules', type: 'number' }, { key: 'actualWeight', label: 'Weighed at home (kg)', type: 'number', hint: 'Leave empty until you weigh it. Nothing is guessed.' }]}
      values={b ? { maxWeight: b.maxWeight, actualWeight: b.actualWeight } : {}} onSave={(v) => b && bagsC.update(b.id, { maxWeight: v.maxWeight as number | null, actualWeight: v.actualWeight as number | null })} />
  );
}

// ---------- remembered scroll position ----------
const SCROLL_KEY = 'hk26.packscroll';
function readScroll(key: string): number { try { return Number(JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}')[key]) || 0; } catch { return 0; } }
function writeScroll(key: string, y: number) { try { const m = JSON.parse(localStorage.getItem(SCROLL_KEY) || '{}'); m[key] = Math.round(y); localStorage.setItem(SCROLL_KEY, JSON.stringify(m)); } catch { /* ignore */ } }

// ---------- outfit photos (kept encrypted in your private document vault, included in backups) ----------
function useOutfitUrl(docId?: string) {
  const { vault } = usePack();
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!docId) { setUrl(null); return; }
    let live = true; let u: string | null = null;
    readOriginal(vault.key, docId).then(({ bytes, meta }) => { if (live) { u = URL.createObjectURL(new Blob([bytes], { type: meta.mime })); setUrl(u); } }).catch(() => live && setUrl(null));
    return () => { live = false; if (u) URL.revokeObjectURL(u); };
  }, [docId, vault.key]);
  return url;
}
function OutfitThumb({ docId, onOpen }: { docId: string; onOpen: () => void }) {
  const url = useOutfitUrl(docId);
  return <button aria-label="View outfit photo" onClick={onOpen} className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sky-soft">{url && <img src={url} alt="" className="h-full w-full object-cover" />}</button>;
}
function PhotoDialog({ open, onClose, item }: { open: boolean; onClose: () => void; item?: Inv }) {
  const { vault, say } = usePack();
  const doc = vault.outfitDocs.find((d) => d.outfitId === item?.id);
  const url = useOutfitUrl(open ? doc?.id : undefined);
  const [busy, setBusy] = useState(false);
  async function pick(files: FileList | null) {
    const f = files?.[0]; if (!f || !item) return;
    setBusy(true);
    try { const old = doc; await vault.add([f], { folder: '06 - Itinerary & Maps', outfitId: item.id }); if (old) await vault.remove(old.id); say('Outfit photo saved'); } finally { setBusy(false); }
  }
  return (
    <Sheet open={open} onClose={onClose} title={item ? `Outfit · ${item.name}` : 'Outfit photo'}>
      <div className="space-y-3 pb-2 pt-1">
        {url ? <img src={url} alt="Outfit" className="max-h-[50dvh] w-full rounded-2xl object-contain bg-paper" /> : <div className="grid h-32 place-items-center rounded-2xl bg-paper text-[14px] text-muted">{busy ? 'Saving…' : 'No photo yet'}</div>}
        <input id="outfit-photo-input" type="file" accept="image/*" className="sr-only" onChange={(e) => { void pick(e.target.files); e.target.value = ''; }} />
        <label htmlFor="outfit-photo-input" className="tap flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-4 py-3 font-bold text-white"><Camera size={18} />{doc ? 'Replace photo' : 'Choose or take a photo'}</label>
        {doc && <Btn variant="danger" className="w-full" onClick={async () => { await vault.remove(doc.id); say('Photo removed'); }}>Remove photo</Btn>}
        <p className="text-[12px] text-muted">Optional. Saved encrypted on this phone only and included in your encrypted backup.</p>
      </div>
    </Sheet>
  );
}
