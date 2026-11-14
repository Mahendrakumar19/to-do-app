import { useRef, useState } from 'react';
import { formatTimeRange } from '../lib/week';

const REVEAL = 80;

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const startX = useRef(0);
  const [offset, setOffset] = useState(0);
  const done = task.status === 'Completed';

  return (
    <div className="relative overflow-hidden">
      <button
        onClick={() => onDelete(task)}
        className="absolute inset-y-0 right-0 w-20 bg-red-500 text-sm font-medium text-white"
      >
        Delete
      </button>

      <div
        className="relative flex items-center gap-3 bg-[#FBFBFE] py-4 transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - startX.current;
          setOffset(Math.max(-REVEAL, Math.min(0, dx)));
        }}
        onTouchEnd={() => setOffset((o) => (o < -REVEAL / 2 ? -REVEAL : 0))}
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Mark "${task.title}" as ${done ? 'in progress' : 'completed'}`}
          onClick={() => onToggle(task)}
          className="grid h-5 w-5 shrink-0 place-items-center rounded-[3px] border-2 border-brand bg-white"
        >
          {done && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4568EA" strokeWidth="3.5">
              <path d="M4 12l5 5L20 6" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onEdit(task)}>
          <p className={`truncate text-sm ${done ? 'text-slate-900 line-through' : 'text-slate-900'}`}>{task.title}</p>
          <p className="truncate text-xs text-slate-400">
            {formatTimeRange(task.dueAt, task.endAt)} · {task.priority}
          </p>
        </div>

        <button aria-label="Delete task" onClick={() => onDelete(task)} className="p-1 text-slate-400 hover:text-red-500">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6" />
          </svg>
        </button>
        <button aria-label="Edit task" onClick={() => onEdit(task)} className="p-1 text-slate-400 hover:text-brand">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
