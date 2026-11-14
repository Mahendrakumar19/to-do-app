import { useEffect, useState } from 'react';
import { api } from './api';
import Onboarding from './components/Onboarding';
import DateStrip from './components/DateStrip';
import TaskForm from './components/TaskForm';
import TaskItem from './components/TaskItem';
import { dateKey, dateKeyOfIso, weekKeyOf, weekLabel } from './lib/week';

const ONBOARD_KEY = 'todo-onboarded';

const SearchIcon = ({ className = 'text-slate-900' }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function App() {
  const [onboarded, setOnboarded] = useState(() => localStorage.getItem(ONBOARD_KEY) === '1');
  const [view, setView] = useState('home'); // 'home' | 'search'
  const [selected, setSelected] = useState(() => new Date());
  const [weeks, setWeeks] = useState([]);
  const [weekTasks, setWeekTasks] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [openWeek, setOpenWeek] = useState(null);
  const [openWeekTasks, setOpenWeekTasks] = useState([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | task
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  const currentKey = weekKeyOf(selected);
  const refresh = () => setVersion((v) => v + 1);

  useEffect(() => {
    if (!onboarded) return;
    api.weeks().then(setWeeks).catch((e) => setError(e.message));
    api.tasks({ weekKey: currentKey }).then(setWeekTasks).catch((e) => setError(e.message));
  }, [onboarded, currentKey, version]);

  useEffect(() => {
    if (!openWeek) return;
    api.tasks({ weekKey: openWeek }).then(setOpenWeekTasks).catch((e) => setError(e.message));
  }, [openWeek, version]);

  useEffect(() => {
    if (view !== 'search') return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    api.tasks({ q: query.trim() }).then(setResults).catch((e) => setError(e.message));
  }, [view, query, version]);

  if (!onboarded) {
    return (
      <Onboarding
        onStart={() => {
          localStorage.setItem(ONBOARD_KEY, '1');
          setOnboarded(true);
        }}
      />
    );
  }

  async function save(body) {
    if (editing && editing !== 'new') await api.update(editing._id, body);
    else await api.create(body);
    setEditing(null);
    refresh();
  }

  async function toggleStatus(task) {
    try {
      await api.update(task._id, { status: task.status === 'Completed' ? 'In Progress' : 'Completed' });
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await api.remove(task._id);
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }

  const summary = weeks.find((w) => w.weekKey === currentKey) || { open: 0, completed: 0 };
  const total = summary.open + summary.completed;
  const pct = total ? Math.round((summary.completed / total) * 100) : 0;
  const dayKey = dateKey(selected);
  const dayTasks = weekTasks.filter((t) => dateKeyOfIso(t.dueAt) === dayKey);
  const isToday = dayKey === dateKey(new Date());

  const renderTask = (task) => (
    <TaskItem key={task._id} task={task} onToggle={toggleStatus} onEdit={setEditing} onDelete={remove} />
  );

  const modal = editing && (
    <TaskForm
      task={editing === 'new' ? null : editing}
      defaultDate={selected}
      onSave={save}
      onClose={() => setEditing(null)}
    />
  );

  const errorBanner = error && (
    <div className="mb-4 cursor-pointer rounded-md bg-red-50 p-3 text-sm text-red-700" onClick={() => setError('')}>
      {error} <span className="opacity-60">(tap to dismiss)</span>
    </div>
  );

  // ---------- Search screen ----------
  if (view === 'search') {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-white px-6 pt-12">
        <button
          aria-label="Back"
          onClick={() => {
            setView('home');
            setQuery('');
          }}
          className="text-slate-900"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>

        <div className="mt-6 flex h-12 items-center rounded-sm border border-slate-200 px-4">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a task"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <SearchIcon />
        </div>

        <div className="mt-6">{errorBanner}</div>

        <div className="divide-y divide-slate-200">
          {query.trim() && results.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">No matching tasks</p>
          )}
          {results.map(renderTask)}
        </div>

        {modal}
      </div>
    );
  }

  // ---------- Home screen ----------
  return (
    <div className="mx-auto min-h-screen max-w-md pb-32">
      <div className="px-6 pt-8">
        <button
          onClick={() => setView('search')}
          className="flex h-12 w-full items-center justify-between rounded-sm border border-slate-200 bg-white px-4 text-left text-sm text-slate-400"
        >
          Search for a task
          <SearchIcon className="text-slate-900" />
        </button>

        <div className="mt-5">
          <DateStrip selected={selected} onSelect={setSelected} />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <StatCard tone="blue" label="Task Complete" value={summary.completed} />
          <StatCard tone="red" label="Task Pending" value={summary.open} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-black">Weekly Progress</h2>
          <div className="mt-3 h-6 overflow-hidden bg-brand-light">
            <div className="h-full bg-brand-dark transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">{isToday ? 'Tasks Today' : 'Tasks'}</h2>
            <button onClick={() => setShowAll((s) => !s)} className="text-sm font-medium text-brand">
              {showAll ? 'Hide weeks' : 'View All'}
            </button>
          </div>

          {errorBanner}

          <div className="mt-2 divide-y divide-slate-200">
            {dayTasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No tasks for this day.</p>
            ) : (
              dayTasks.map(renderTask)
            )}
          </div>
        </div>

        {showAll && (
          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold text-black">Weeks</h2>
            {weeks.length === 0 && <p className="text-sm text-slate-500">No weeks yet.</p>}
            {weeks.map((w) => {
              const t = w.open + w.completed;
              const p = t ? Math.round((w.completed / t) * 100) : 0;
              const isOpen = openWeek === w.weekKey;
              return (
                <section key={w.weekKey} className="rounded-lg border border-slate-200 bg-white p-4">
                  <button onClick={() => setOpenWeek(isOpen ? null : w.weekKey)} className="w-full text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{weekLabel(w.weekKey)}</span>
                      <span className="text-slate-400">{isOpen ? '▲' : '▼'}</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span>
                        <b className="text-brand">{w.open}</b> open
                      </span>
                      <span>
                        <b className="text-emerald-600">{w.completed}</b> completed
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 bg-brand-light">
                      <div className="h-full bg-brand-dark" style={{ width: `${p}%` }} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="mt-3 divide-y divide-slate-200 border-t border-slate-200 pt-2">
                      {openWeekTasks.length === 0 ? (
                        <p className="py-3 text-sm text-slate-500">No tasks this week.</p>
                      ) : (
                        openWeekTasks.map(renderTask)
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <button
        aria-label="Add task"
        onClick={() => setEditing('new')}
        className="fixed bottom-10 left-1/2 flex h-[72px] w-[72px] -translate-x-1/2 items-center justify-center rounded-full bg-brand text-4xl font-light text-white shadow-lg hover:bg-brand-dark"
      >
        +
      </button>

      {modal}
    </div>
  );
}

function StatCard({ tone, label, value }) {
  const isBlue = tone === 'blue';
  return (
    <div className={`rounded-lg p-4 ${isBlue ? 'bg-[#EEF2FE]' : 'bg-[#FFE6E9]'}`}>
      <div className="flex items-center gap-3 text-sm text-black">
        <span
          className={`grid h-7 w-7 place-items-center rounded-[3px] ${isBlue ? 'bg-[#A7B8F7]' : 'bg-[#F7A3AD]'}`}
        >
          {isBlue ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#243B9A" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M7 12l3 3 7-7" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B3212E" strokeWidth="2.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M8 8l8 8M16 8l-8 8" />
            </svg>
          )}
        </span>
        {label}
      </div>
      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-[28px] font-bold leading-none text-black">{String(value).padStart(2, '0')}</span>
        <span className="text-xs text-slate-500">This Week</span>
      </p>
    </div>
  );
}
