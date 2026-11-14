import { useState } from 'react';
import { dateKey, formatLongDate, toTimeInput } from '../lib/week';

const PRIORITIES = ['Low', 'Medium', 'High'];
const box = 'flex h-11 w-full items-center rounded-sm border border-slate-200 bg-white px-3 text-sm text-slate-900';
const label = 'mb-2 block text-[13px] text-slate-500';

// Shows a formatted value while a native picker sits invisibly on top, so clicks open the picker
function PickerBox({ icon, display, type, value, onChange, placeholder }) {
  return (
    <div className={`relative ${box}`}>
      {icon}
      <span className={`ml-2 flex-1 ${display ? 'text-slate-900' : 'text-slate-900'}`}>
        {display || <span className="text-slate-900">{placeholder}</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label={placeholder}
      />
    </div>
  );
}

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-900">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-slate-900">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

export default function TaskForm({ task, defaultDate, onSave, onClose }) {
  const initialDate = task ? new Date(task.dueAt) : defaultDate ?? new Date();

  const [form, setForm] = useState({
    title: task?.title ?? '',
    date: dateKey(initialDate),
    start: task ? toTimeInput(task.dueAt) : '',
    end: task?.endAt ? toTimeInput(task.endAt) : '',
    priority: task?.priority ?? 'Medium',
    description: task?.description ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const [y, m, d] = form.date ? form.date.split('-').map(Number) : [];
  const dateDisplay = form.date ? formatLongDate(new Date(y, m - 1, d)) : '';

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('Task title is required');
    if (!form.date) return setError('Date is required');
    if (!form.start) return setError('Start time is required');

    const start = new Date(`${form.date}T${form.start}`);
    const end = form.end ? new Date(`${form.date}T${form.end}`) : null;
    if (end && end <= start) return setError('End time must be after start time');

    setSaving(true);
    setError('');
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        dueAt: start.toISOString(),
        endAt: end ? end.toISOString() : null,
      });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/30" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[72%] w-full max-w-md flex-col bg-white px-6 pb-8 pt-7"
      >
        <div className="mb-7 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-black">{task ? 'Edit Task' : 'Add New Task'}</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-black">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto">
          <div>
            <label className={label}>Task title</label>
            <input
              className={`${box} outline-none focus:border-brand`}
              value={form.title}
              onChange={set('title')}
              placeholder="Doing Homework"
            />
          </div>

          <div>
            <label className={label}>Set Time</label>
            <div className="grid grid-cols-2 gap-3">
              <PickerBox
                icon={<ClockIcon />}
                display={form.start}
                placeholder="Start"
                type="time"
                value={form.start}
                onChange={set('start')}
              />
              <PickerBox
                icon={<ClockIcon />}
                display={form.end}
                placeholder="Ends"
                type="time"
                value={form.end}
                onChange={set('end')}
              />
            </div>
          </div>

          <div>
            <label className={label}>Set Date</label>
            <PickerBox
              icon={null}
              display={dateDisplay}
              placeholder="Pick a date"
              type="date"
              value={form.date}
              onChange={set('date')}
            />
          </div>

          <div>
            <label className={label}>Priority</label>
            <select className={`${box} outline-none focus:border-brand`} value={form.priority} onChange={set('priority')}>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={label}>Description</label>
            <textarea
              className="h-24 w-full resize-none rounded-sm border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand"
              value={form.description}
              onChange={set('description')}
              placeholder="Add Description"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-auto h-14 rounded-sm bg-brand text-base font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
        </button>
      </form>
    </div>
  );
}
