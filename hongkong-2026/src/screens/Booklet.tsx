import { useState } from 'react';
import { Download, FileText, Share2, TriangleAlert, Printer } from 'lucide-react';
import { ACTIVITIES, ALL_DAYS as DAYS, EMERGENCY, EXPENSES, FLIGHTS, FUNDING, SHOPPING, TICKETS } from '../data/seed';
import { DAYBAG, FINALS } from '../data/pack';
import { GATES } from '../data/gates';
import { useAppState, useChecks, useCollection } from '../state/store';
import { buildBookletPages, imposeBooklet, imposeOrder } from '../lib/booklet';
import { computeBudget } from '../lib/budget';
import { fmtHKD, fmtPHP, fmtPHP2, hkdToPhp, toHKD } from '../lib/money';
import { normCat, routeAdjust } from '../lib/trip';
import { KEY_ADDRESSES } from '../data/addresses';

/** Chinese text is drawn with the phone's own font into a small picture, because the standard PDF fonts cannot show Chinese. */
async function zhPng(text: string): Promise<Uint8Array | null> {
  try {
    const c = document.createElement('canvas'); const ctx = c.getContext('2d'); if (!ctx) return null;
    const font = 'bold 36px "PingFang HK","Noto Sans CJK TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
    ctx.font = font; c.width = Math.ceil(ctx.measureText(text).width) + 8; c.height = 52; ctx.font = font; ctx.fillStyle = '#000'; ctx.textBaseline = 'middle'; ctx.fillText(text, 4, 27);
    const blob = await new Promise<Blob | null>((res) => c.toBlob(res, 'image/png')); return blob ? new Uint8Array(await blob.arrayBuffer()) : null;
  } catch { return null; }
}
import { Btn, Card, PageHeader, SectionTitle, Toggle, cx } from '../ui/primitives';
import { PdfPreview } from '../ui/PdfPreview';
import type { Activity, EmergencyItem, Expense, Flight, Ticket } from '../types';
import type { DayItem, FinalItem } from '../lib/packTypes';

interface Built { content: Uint8Array; sheets: Uint8Array; pages: number }
const save = (bytes: Uint8Array, name: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 30000); };

export function Booklet() {
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const tickets = useCollection<Ticket>('tickets', TICKETS).items;
  const flights = useCollection<Flight>('flights', FLIGHTS).items;
  const dayItems = useCollection<DayItem>('daybag', DAYBAG).items;
  const finals = useCollection<FinalItem>('finals', FINALS).items;
  const exps = useCollection<Expense>('expenses', EXPENSES).items;
  const shop = useCollection('shopping', SHOPPING).items;
  const emerg = useCollection<EmergencyItem>('emergency', EMERGENCY).items;
  const { checks } = useChecks();
  const { state, hotel } = useAppState(); const r = state.settings.rates;
  const [built, setBuilt] = useState<Built | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [view, setView] = useState<'sheets' | 'pages'>('sheets');
  const [money, setMoney] = useState(true);

  async function make() {
    setBusy(true); setErr(''); setBuilt(null);
    try {
      const b = computeBudget(acts, exps, shop, checks, r, routeAdjust(acts, state.notes));
      const paidE = exps.filter((e) => e.kind === 'spend' && (e.status === 'paid' || e.status === 'actual') && e.amount);
      const php = (e: Expense) => (e.currency === 'PHP' ? e.amount ?? 0 : hkdToPhp(toHKD(e.amount ?? 0, e.currency, r), r));
      const shopP = paidE.filter((e) => normCat(e.category) === 'Shopping').reduce((n, e) => n + php(e), 0);
      const travelP = paidE.filter((e) => normCat(e.category) !== 'Shopping').reduce((n, e) => n + php(e), 0);
      const fund = FUNDING.reduce((n, f) => n + f.amount, 0);
      const cap = state.settings.capPHP ?? 150000; const used = hkdToPhp(b.paidTotal + b.remaining, r);
      const toVerifyN = exps.filter((e) => e.kind === 'spend' && e.status === 'to_verify').length;
      const budget = money ? [
        { label: 'Travel costs paid', value: fmtPHP2(travelP) }, { label: 'Travel shopping paid', value: fmtPHP2(shopP) }, { label: 'Combined paid', value: fmtPHP2(travelP + shopP) },
        { label: 'Trip funding allocation (not a bank balance)', value: fmtPHP2(fund) },
        { label: 'Quoted (Uber etc., not booked/paid)', value: `${fmtHKD(b.quoted)} / ${fmtPHP(hkdToPhp(b.quoted, r))}` },
        { label: 'Planned still to spend', value: `${fmtHKD(b.remaining)} / ${fmtPHP(hkdToPhp(b.remaining, r))}` },
        { label: 'Refundable hold (hotel deposit)', value: fmtHKD(b.holds) }, { label: 'Items still to verify (not counted)', value: String(toVerifyN) },
        { label: 'Budget cap', value: fmtPHP(cap) }, { label: 'Left under the cap', value: fmtPHP(cap - used) },
        { label: 'Exchange rate used', value: `HK$1 = PHP ${r.hkdToPhp.toFixed(2)}${r.setAt ? ' (set ' + new Date(r.setAt).toLocaleDateString() + ')' : ''}` },
      ] : null;
      const content = await buildBookletPages({ acts, days: DAYS, tickets, flights, hotel, dayItems, finals, gates: GATES, budget, emergency: emerg, generated: new Date().toLocaleString(), routeChoice: Object.fromEntries(Object.entries(state.notes).filter(([k]) => k.startsWith('route:')).map(([k, v]) => [k.slice(6), v])), keyAddresses: KEY_ADDRESSES, zhPng });
      const sheets = await imposeBooklet(content);
      const { PDFDocument } = await import('pdf-lib'); const pages = (await PDFDocument.load(content)).getPageCount();
      setBuilt({ content, sheets, pages });
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not build the booklet.'); }
    setBusy(false);
  }
  async function share(bytes: Uint8Array, name: string) {
    const f = new File([bytes as BlobPart], name, { type: 'application/pdf' });
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: name }); return; } catch { /* fall back */ } }
    save(bytes, name);
  }
  const order = built ? imposeOrder(built.pages) : [];
  return (
    <div className="pb-4">
      <PageHeader title="Print booklet" back="more" sub="US Letter → folded half-letter (5.5 × 8.5 in)" />
      <Card className="mb-3 space-y-2 p-4 text-[14px]">
        <div className="flex items-center gap-2 font-bold text-navy"><Printer size={18} />How it prints</div>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Make the booklet, then download the <b>Print sheets (Letter)</b> PDF.</li><li>Print on <b>US Letter, landscape, 100% / Actual size</b>.</li><li>Choose <b>double-sided, flip on the short edge</b>.</li><li>Stack the sheets in the order printed, fold in half, staple along the fold.</li>
        </ol>
        <p className="text-[13px] text-muted">The pages are re-ordered (“imposed”) for you so they read 1, 2, 3… after folding, with wide margins at the fold, page numbers and tick-boxes. It is made on this phone and works offline. It never includes passport numbers or ticket QR codes.</p>
      </Card>
      <Card className="mb-3 flex items-center gap-3 p-4"><div className="flex-1"><div className="font-bold text-navy">Include the money page</div><div className="text-[13px] text-muted">Turn off if you will share or leave the booklet somewhere.</div></div><Toggle label="Include the money page" on={money} onChange={setMoney} /></Card>
      <Btn className="w-full !py-3.5" icon={<FileText size={18} />} onClick={() => void make()} disabled={busy}>{busy ? 'Building…' : built ? 'Rebuild booklet' : 'Make the booklet'}</Btn>
      {err && <p role="alert" className="mt-2 text-[14px] font-bold text-coral">{err}</p>}
      {built && (
        <>
          <SectionTitle>{built.pages} pages · {built.pages / 4} sheets ({built.pages / 2} printed sides)</SectionTitle>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <Btn icon={<Download size={17} />} onClick={() => save(built.sheets, 'hong-kong-2026-booklet-PRINT-letter-imposed.pdf')}>Print sheets</Btn>
            <Btn variant="soft" icon={<Download size={17} />} onClick={() => save(built.content, 'hong-kong-2026-booklet-reading-order.pdf')}>Reading order</Btn>
            <Btn variant="ghost" icon={<Share2 size={17} />} className="col-span-2" onClick={() => void share(built.sheets, 'hong-kong-2026-booklet-PRINT-letter-imposed.pdf')}>Share the print file…</Btn>
          </div>
          <div className="mb-2 flex gap-2" role="tablist" aria-label="Preview">
            {([['sheets', 'Print sheets (imposed)'], ['pages', 'Reading order']] as const).map(([k, l]) => <button key={k} role="tab" aria-selected={view === k} onClick={() => setView(k)} className={cx('tap flex-1 rounded-2xl px-3 text-[13px] font-bold', view === k ? 'bg-navy text-white' : 'bg-white text-navy shadow-sm')}>{l}</button>)}
          </div>
          <PdfPreview key={view} bytes={view === 'sheets' ? built.sheets : built.content} label={view === 'sheets' ? 'Print sheet' : 'Booklet'} />
          <SectionTitle>Page order on each sheet</SectionTitle>
          <Card className="p-3"><table className="w-full text-[13px]"><thead><tr className="text-left text-muted"><th className="py-1">Sheet</th><th>Side</th><th>Left</th><th>Right</th></tr></thead><tbody>{order.map((o) => <tr key={o.sheet + o.side} className="border-t border-navy/5"><td className="py-1">{o.sheet}</td><td>{o.side}</td><td>p. {o.left}</td><td>p. {o.right}</td></tr>)}</tbody></table></Card>
          <p className="mt-2 flex gap-2 px-1 text-[12px] text-muted"><TriangleAlert size={14} className="mt-0.5 shrink-0" />Rebuild the booklet after you change the plan so it matches. Do a test print of one sheet first to check the fold.</p>
        </>
      )}
    </div>
  );
}
