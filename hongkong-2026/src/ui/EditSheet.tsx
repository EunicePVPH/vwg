import { useEffect, useState } from 'react';
import { Sheet, Btn } from './primitives';
import { RotateCcw, Trash2 } from 'lucide-react';

export interface Field {
  key: string; label: string;
  type: 'text' | 'time' | 'number' | 'select' | 'textarea' | 'date';
  options?: { value: string; label: string }[];
  hint?: string; placeholder?: string;
}
type Vals = Record<string, string | number | null | undefined>;

export function EditSheet({ open, onClose, title, fields, values, onSave, onDelete, onRestore, saveLabel = 'Save' }: {
  open: boolean; onClose: () => void; title: string; fields: Field[]; values: Vals;
  onSave: (v: Vals) => void; onDelete?: () => void; onRestore?: () => void; saveLabel?: string;
}) {
  const [v, setV] = useState<Vals>(values);
  useEffect(() => { if (open) setV(values); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const input = 'w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3 text-[16px] text-ink placeholder:text-muted/70';
  return (
    <Sheet open={open} onClose={onClose} title={title} tall={fields.some((f) => f.type === 'textarea')}>
      <form className="space-y-4 pt-2" onSubmit={(e) => {
        e.preventDefault();
        const out: Vals = { ...v };
        for (const f of fields) if (f.type === 'number') { const x = v[f.key]; out[f.key] = x === '' || x === null || x === undefined ? null : Number(x); }
        onSave(out); onClose();
      }}>
        {fields.map((f) => (
          <label key={f.key} className="block">
            <span className="mb-1 block text-[14px] font-bold text-navy">{f.label}</span>
            {f.type === 'textarea' ? <textarea rows={4} className={input} value={String(v[f.key] ?? '')} placeholder={f.placeholder} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
              : f.type === 'select' ? <select className={input} value={String(v[f.key] ?? '')} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>{f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
              : <input className={input} type={f.type === 'number' ? 'number' : f.type === 'time' ? 'time' : f.type === 'date' ? 'date' : 'text'} inputMode={f.type === 'number' ? 'decimal' : undefined} step={f.type === 'number' ? 'any' : undefined}
                  value={String(v[f.key] ?? '')} placeholder={f.placeholder} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />}
            {f.hint && <span className="mt-1 block text-[13px] text-muted">{f.hint}</span>}
          </label>
        ))}
        <div className="flex flex-wrap gap-2 pt-2">
          <Btn type="submit" className="flex-1">{saveLabel}</Btn>
          {onRestore && <Btn type="button" variant="ghost" icon={<RotateCcw size={18} />} onClick={() => { onRestore(); onClose(); }}>Restore original</Btn>}
          {onDelete && <Btn type="button" variant="danger" icon={<Trash2 size={18} />} onClick={() => { if (confirm('Delete this item?')) { onDelete(); onClose(); } }}>Delete</Btn>}
        </div>
      </form>
    </Sheet>
  );
}
