import { isSameDay, weekDays } from '../lib/week';

const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DateStrip({ selected, onSelect }) {
  const today = new Date();
  return (
    <div className="grid grid-cols-7 text-center">
      {weekDays(selected).map((d, i) => {
        const active = isSameDay(d, selected);
        return (
          <button
            key={i}
            onClick={() => onSelect(d)}
            className={`flex flex-col items-center py-2 text-[11px] ${active ? 'bg-brand text-white' : 'text-slate-400'}`}
          >
            <span>{LABELS[i]}</span>
            <span className={`mt-1 text-sm ${active ? 'font-semibold text-white' : 'font-medium text-slate-400'}`}>
              {String(d.getDate()).padStart(2, '0')}
            </span>
            {isSameDay(d, today) && <span className={`mt-1 h-1 w-1 rounded-full ${active ? 'bg-white' : 'bg-brand'}`} />}
          </button>
        );
      })}
    </div>
  );
}
