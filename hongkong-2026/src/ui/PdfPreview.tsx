import { useEffect, useRef, useState } from 'react';
import { destroyPdf, openPdf } from '../lib/pdf';
import { PlaneLoader } from './primitives';

/** Renders every page of a PDF (from bytes, on this device) as a stack of images. */
export function PdfPreview({ bytes, label }: { bytes: Uint8Array; label: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [count, setCount] = useState(0);
  useEffect(() => {
    let live = true; let pdf: Awaited<ReturnType<typeof openPdf>> | null = null;
    setState('loading');
    (async () => {
      try {
        pdf = await openPdf(bytes); if (!live) return; setCount(pdf.numPages);
        const host = wrap.current; if (!host) return; host.replaceChildren();
        const cssW = Math.min(host.clientWidth || 340, 560); const dpr = Math.min(window.devicePixelRatio || 1, 2);
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n); if (!live) return;
          const base = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: (cssW / base.width) * dpr });
          const c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
          c.style.cssText = `width:${cssW}px;height:auto;display:block;margin:0 auto 10px;background:#fff;box-shadow:0 1px 6px rgba(18,40,76,.25);border-radius:4px`;
          c.setAttribute('role', 'img'); c.setAttribute('aria-label', `${label} page ${n}`);
          await page.render({ canvasContext: c.getContext('2d')!, viewport: vp, canvas: c }).promise; host.appendChild(c);
          if (n === 1) setState('ready');
        }
        if (live) setState('ready');
      } catch { if (live) setState('error'); }
    })();
    return () => { live = false; destroyPdf(pdf); };
  }, [bytes, label]);
  return (<div>{state === 'loading' && <PlaneLoader label="Rendering preview…" />}{state === 'error' && <p className="p-4 text-coral">Could not render the preview.</p>}<div ref={wrap} data-pages={count} className="bg-[#e8eef9] p-2" /></div>);
}
