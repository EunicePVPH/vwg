import { useMemo, useState } from 'react';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { TASKS } from '../data/seed';
import { useChecks, useCollection } from '../state/store';
import { dateLabel } from '../lib/time';
import { Btn, Card, PageHeader, SectionTitle, StatusPill, cx } from '../ui/primitives';
import { Ring } from '../ui/Ring';
import { Confetti } from '../ui/Confetti';
import { EditSheet, type Field } from '../ui/EditSheet';
import type { Status, Task } from '../types';

const TASK_FIELDS: Field[] = [
  { key: 'title', label: 'Task', type: 'text' },
  { key: 'group', label: 'Group', type: 'text' },
  { key: 'due', label: 'Do by', type: 'date' },
  { key: 'status', label: 'Status', type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'verify', label: 'Needs verification' }, { value: 'confirmed', label: 'Confirmed' }, { value: 'optional', label: 'Optional' }] },
  { key: 'note', label: 'Notes', type: 'textarea' },
];

export function Ready() {
  const { items, update, add, remove, restore, isEdited, isSeed } = useCollection<Task>('tasks', TASKS);
  const { checks, toggle } = useChecks();
  const [edit, setEdit] = useState<Task | null>(null);
  const [adding, setAdding] = useState(false);
  const [burst, setBurst] = useState(0);
  const groups = useMemo(() => { const m = new Map<string, Task[]>(); for (const t of items) (m.get(t.group) ?? m.set(t.group, []).get(t.group)!).push(t); return [...m.entries()]; }, [items]);
  const done = items.filter((t) => checks['task:' + t.id]).length;
  const tick = (t: Task) => {
    const was = !!checks['task:' + t.id]; toggle('task:' + t.id);
    if (!was) { const g = items.filter((x) => x.group === t.group); if (g.every((x) => x.id === t.id || checks['task:' + x.id])) setBurst((b) => b + 1); }
  };
  return (
    <div className="pb-4">
      <Confetti burst={burst} />
      <PageHeader title="Travel Ready" back="more" right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />
      <Card className="mb-2 flex items-center gap-4 !bg-navy p-4 text-white">
        <Ring value={items.length ? done / items.length : 0} size={88} stroke={10}><span className="font-display text-[22px] font-bold text-sun">{Math.round((items.length ? done / items.length : 0) * 100)}%</span></Ring>
        <div><div className="text-[18px] font-bold">{done} of {items.length} done</div><div className="text-[14px] text-white/75">{items.filter((t) => t.critical && !checks['task:' + t.id]).length} important left</div></div>
      </Card>
      {groups.map(([g, ts]) => (
        <section key={g}>
          <SectionTitle><span>{g}</span></SectionTitle>
          <Card className="divide-y divide-navy/5 overflow-hidden">
            {ts.map((t) => (
              <div key={t.id} className="flex items-start gap-3 px-4 py-3">
                <input type="checkbox" aria-label={t.title} checked={!!checks['task:' + t.id]} onChange={() => tick(t)} className="mt-1 h-6 w-6 shrink-0 accent-[#14b8a6]" />
                <div className="min-w-0 flex-1">
                  <div className={cx('text-[15px] font-bold leading-snug text-navy', checks['task:' + t.id] && 'text-muted line-through')}>{t.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">{t.critical && <span className="text-[12px] font-bold text-coral">Important</span>}<StatusPill status={t.status} />{t.due && <span className="text-[12px] text-muted">by {dateLabel(t.due, { day: 'numeric', month: 'short' })}</span>}</div>
                  {t.note && <div className="mt-1 text-[13px] text-muted">{t.note}</div>}
                  {t.link && <a href={t.link.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[13px] font-bold text-sky"><ExternalLink size={13} />{t.link.label}</a>}
                </div>
                <button onClick={() => setEdit(t)} aria-label="Edit task" className="tap grid place-items-center text-muted"><Pencil size={17} /></button>
              </div>
            ))}
          </Card>
        </section>
      ))}
      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit task" fields={TASK_FIELDS} values={edit ? { title: edit.title, group: edit.group, due: edit.due ?? '', status: edit.status, note: edit.note ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { title: String(v.title || edit.title), group: String(v.group || edit.group), due: v.due ? String(v.due) : undefined, status: v.status as Status, note: String(v.note ?? '') })}
        onDelete={edit ? () => remove(edit.id) : undefined} onRestore={edit && isSeed(edit.id) && isEdited(edit.id) ? () => restore(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="New task" saveLabel="Add" fields={TASK_FIELDS} values={{ title: '', group: 'Before you go', due: '', status: 'pending', note: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), title: String(v.title || 'New task'), group: String(v.group || 'Before you go'), due: v.due ? String(v.due) : undefined, status: (v.status as Status) || 'pending', note: String(v.note ?? '') })} />
    </div>
  );
}
