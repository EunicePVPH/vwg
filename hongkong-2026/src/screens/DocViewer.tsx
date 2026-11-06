import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Minus, Plus, ShieldCheck, TriangleAlert, X, Maximize2, FileText } from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { readOriginal } from '../lib/vault';
import { destroyPdf, openPdf } from '../lib/pdf';
import { PlaneLoader, useBackClose } from '../ui/primitives';
import type { DocMeta, DocRecord } from '../types';

/**
 * Full-screen ORIGINAL viewer. Images are shown by the browser straight from the stored
 * bytes (no re-encoding, only proportional CSS scaling). PDFs are rendered by PDF.js.
 * Nothing is drawn on top of the document.
 */
export function DocViewer({ docs, start = 0, dataKey, onClose, title }: { docs: DocRecord[]; start?: number; dataKey: CryptoKey; onClose: () => void; title?: string }) {
  const [i, setI] = useState(Math.min(start, docs.length - 1));
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState<DocMeta | null>(null);
  const [intact, setIntact] = useState<boolean | null>(null);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [aspect, setAspect] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  const doc = docs[i];

  // Android back button closes the viewer
  useBackClose(true, onClose);

  // keep the screen awake while a ticket is on display
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const req = async () => { try { lock = (await navigator.wakeLock?.request('screen')) ?? null; } catch { /* unsupported */ } };
    void req();
    const vis = () => { if (document.visibilityState === 'visible') void req(); };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); void lock?.release(); };
  }, []);

  useEffect(() => {
    if (!doc) return;
    let live = true; let url: string | null = null; let p: PDFDocumentProxy | null = null;
    setLoading(true); setError(''); setImgUrl(null); setPdf(null); setZoom(1); setIntact(null);
    (async () => {
      try {
        const { bytes, meta, intact } = await readOriginal(dataKey, doc.id);
        if (!live) return;
        setMeta(meta); setIntact(intact);
        if (meta.mime === 'application/pdf') { p = await openPdf(bytes); if (!live) { destroyPdf(p); return; } setPdf(p); }
        else { url = URL.createObjectURL(new Blob([bytes], { type: meta.mime })); setImgUrl(url); }
      } catch (e) { if (live) setError(e instanceof Error ? e.message : 'Could not open this file.'); }
      finally { if (live) setLoading(false); }
    })();
    return () => { live = false; if (url) URL.revokeObjectURL(url); destroyPdf(p); };
  }, [doc?.id, dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // pinch + double-tap zoom (proportional only)
  const pts = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ d: number; z: number } | null>(null);
  const anchor = useRef<{ fx: number; fy: number; cx: number; cy: number } | null>(null);
  const lastTap = useRef(0);
  const setZ = useCallback((z: number, cx?: number, cy?: number) => {
    const el = box.current; if (!el) return;
    const nz = Math.max(1, Math.min(6, z));
    const rect = el.getBoundingClientRect();
    const px = (cx ?? rect.left + rect.width / 2) - rect.left, py = (cy ?? rect.top + rect.height / 2) - rect.top;
    anchor.current = { fx: (el.scrollLeft + px) / el.scrollWidth, fy: (el.scrollTop + py) / el.scrollHeight, cx: px, cy: py };
    setZoom(nz);
  }, []);
  useLayoutEffect(() => {
    const el = box.current, a = anchor.current; if (!el || !a) return;
    el.scrollLeft = a.fx * el.scrollWidth - a.cx; el.scrollTop = a.fy * el.scrollHeight - a.cy; anchor.current = null;
  }, [zoom]);
  const onDown = (e: React.PointerEvent) => {
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2) { const [a, b] = [...pts.current.values()]; pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), z: zoom }; }
    else { const now = Date.now(); if (now - lastTap.current < 280) setZ(zoom > 1.2 ? 1 : 2.5, e.clientX, e.clientY); lastTap.current = now; }
  };
  const onMove = (e: React.PointerEvent) => {
    if (!pts.current.has(e.pointerId)) return;
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.current.size === 2 && pinch.current) {
      const [a, b] = [...pts.current.values()];
      setZ(pinch.current.z * (Math.hypot(a.x - b.x, a.y - b.y) / pinch.current.d), (a.x + b.x) / 2, (a.y + b.y) / 2);
    }
  };
  const onUp = (e: React.PointerEvent) => { pts.current.delete(e.pointerId); if (pts.current.size < 2) pinch.current = null; };

  if (!doc) return null;
  const many = docs.length > 1;
  return (
    <motion.div className="fixed inset-0 z-[70] flex flex-col bg-black text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} role="dialog" aria-modal="true" aria-label="Original document">
      <div className="flex items-center gap-2 bg-black px-2 pb-2 pt-[calc(var(--safe-t)+8px)]">
        <button onClick={onClose} aria-label="Close" className="tap grid place-items-center rounded-full bg-white/10"><X size={22} /></button>
        <div className="min-w-0 flex-1 text-center"><div className="truncate text-[14px] font-bold">{title ?? doc.name}</div><div className="truncate text-[12px] text-white/60">{doc.slot ? doc.slot + ' · ' : ''}{doc.name}</div></div>
        <div className="grid h-12 min-w-12 place-items-center text-[13px] font-bold text-white/70">{many ? `${i + 1}/${docs.length}` : ''}</div>
      </div>

      <div ref={box} className="relative flex-1 overflow-auto bg-[#111]" style={{ touchAction: 'pan-x pan-y' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {loading && <div className="grid h-full place-items-center"><PlaneLoader label="Decrypting your original…" /></div>}
        {error && <div className="grid h-full place-items-center p-6 text-center"><div><TriangleAlert className="mx-auto mb-2 text-sun" /><p>{error}</p></div></div>}
        {imgUrl && (
          <div className="grid min-h-full place-items-center bg-white" style={{ width: `${zoom * 100}%` }}>
            <img src={imgUrl} alt={doc.name} draggable={false} style={{ width: '100%', height: 'auto', maxWidth: 'none', display: 'block', imageRendering: zoom > 2 ? 'pixelated' : 'auto' }} onLoad={(e) => setAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight)} />
          </div>
        )}
        {pdf && <PdfPages pdf={pdf} zoom={zoom} boxRef={box} />}
      </div>

      <div className="bg-black px-3 pb-[calc(var(--safe-b)+10px)] pt-2">
        <div className="mb-2 flex items-center justify-center gap-2 text-[12px]">
          {intact === true && <span className="inline-flex items-center gap-1 rounded-full bg-turq/20 px-2.5 py-1 font-bold text-[#7ff0e1]"><ShieldCheck size={14} />Original file — unchanged</span>}
          {intact === false && <span className="inline-flex items-center gap-1 rounded-full bg-coral/30 px-2.5 py-1 font-bold text-[#ffb3a8]"><TriangleAlert size={14} />File differs from import — use your phone copy</span>}
          <span className="text-white/50">Raise screen brightness to scan</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button disabled={i === 0} onClick={() => setI(i - 1)} aria-label="Previous ticket" className="tap flex items-center gap-1 rounded-2xl bg-white/10 px-3 text-[14px] font-bold disabled:opacity-30"><ChevronLeft size={20} />Prev</button>
          <button onClick={() => setZ(zoom - 0.5)} aria-label="Zoom out" className="tap grid place-items-center rounded-2xl bg-white/10"><Minus size={20} /></button>
          <button onClick={() => setZ(1)} aria-label="Fit to screen" className="tap flex items-center gap-1 rounded-2xl bg-white/10 px-3 text-[14px] font-bold"><Maximize2 size={16} />{Math.round(zoom * 100)}%</button>
          <button onClick={() => setZ(zoom + 0.5)} aria-label="Zoom in" className="tap grid place-items-center rounded-2xl bg-white/10"><Plus size={20} /></button>
          <button disabled={i >= docs.length - 1} onClick={() => setI(i + 1)} aria-label="Next ticket" className="tap flex items-center gap-1 rounded-2xl bg-white/10 px-3 text-[14px] font-bold disabled:opacity-30">Next<ChevronRight size={20} /></button>
        </div>
        {meta && <p className="mt-1 text-center text-[11px] text-white/40"><FileText size={11} className="mr-1 inline" />{(meta.size / 1024).toFixed(0)} KB · {aspect ? '' : ''}{meta.mime.replace('application/', '').replace('image/', '').toUpperCase()}</p>}
      </div>
    </motion.div>
  );
}

function PdfPages({ pdf, zoom, boxRef }: { pdf: PDFDocumentProxy; zoom: number; boxRef: React.RefObject<HTMLDivElement | null> }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [sizes, setSizes] = useState<number[]>([]);
  useEffect(() => { const w = boxRef.current?.clientWidth; if (w) setWidth(w); }, [boxRef]);
  useEffect(() => { let live = true; (async () => { const out: number[] = []; for (let n = 1; n <= pdf.numPages; n++) { const v = (await pdf.getPage(n)).getViewport({ scale: 1 }); out.push(v.height / v.width); } if (live) setSizes(out); })(); return () => { live = false; }; }, [pdf]);
  const cssW = width * zoom;
  useEffect(() => {
    if (!sizes.length) return;
    let cancelled = false; const tasks: { cancel: () => void }[] = [];
    const t = setTimeout(async () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      for (let n = 1; n <= pdf.numPages; n++) {
        if (cancelled) return;
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 });
        let scale = (cssW / base.width) * dpr;
        const maxPx = 4096; if (base.width * scale > maxPx) scale = maxPx / base.width;
        const vp = page.getViewport({ scale });
        if (vp.width * vp.height > 16_000_000) continue;
        const canvas = document.createElement('canvas'); canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
        canvas.style.cssText = 'width:100%;height:auto;display:block';
        const task = page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp, canvas });
        tasks.push(task);
        try { await task.promise; } catch { return; }
        if (cancelled) return;
        wrap.current?.querySelector(`[data-p="${n}"]`)?.replaceChildren(canvas);
      }
    }, zoom === 1 ? 0 : 220);
    return () => { cancelled = true; clearTimeout(t); tasks.forEach((x) => x.cancel()); };
  }, [pdf, cssW, sizes, zoom]);
  if (!sizes.length) return <PlaneLoader label="Rendering original PDF…" />;
  return (
    <div ref={wrap} className="mx-auto space-y-2 bg-[#222] py-0" style={{ width: cssW }}>
      {sizes.map((h, k) => <div key={k} data-p={k + 1} className="bg-white" style={{ aspectRatio: `${1} / ${h}` }}><div className="shimmer h-full w-full" /></div>)}
    </div>
  );
}
