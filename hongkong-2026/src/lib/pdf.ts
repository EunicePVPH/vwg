// PDF.js is loaded only when a PDF is opened. The legacy build supports older Android WebViews.
import type { PDFDocumentProxy } from 'pdfjs-dist';
let ready: Promise<typeof import('pdfjs-dist')> | null = null;
export function loadPdfjs() {
  ready ??= (async () => {
    const lib = (await import('pdfjs-dist/legacy/build/pdf.mjs')) as unknown as typeof import('pdfjs-dist');
    const worker = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default as string;
    lib.GlobalWorkerOptions.workerSrc = worker;
    return lib;
  })();
  return ready;
}
export async function openPdf(bytes: Uint8Array): Promise<PDFDocumentProxy> {
  const lib = await loadPdfjs();
  // copy: pdf.js transfers the buffer to its worker, and we keep the original bytes intact
  return lib.getDocument({ data: bytes.slice() }).promise;
}

export const destroyPdf = (p: PDFDocumentProxy | null) => { try { void p?.loadingTask.destroy(); } catch { /* ignore */ } };
