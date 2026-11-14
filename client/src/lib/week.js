const pad = (n) => String(n).padStart(2, '0');

// Local 'YYYY-MM-DD' for a Date
export function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateKeyOfIso(iso) {
  return dateKey(new Date(iso));
}

// Monday 00:00 of the week containing `date` (weeks run Monday to Sunday)
export function getWeekStart(date) {
  const d = new Date(date);
  const offset = (d.getDay() + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offset);
}

export function weekKeyOf(date) {
  return dateKey(getWeekStart(date));
}

// The seven dates (Mon..Sun) of the week containing `date`
export function weekDays(date) {
  const s = getWeekStart(date);
  return Array.from({ length: 7 }, (_, i) => new Date(s.getFullYear(), s.getMonth(), s.getDate() + i));
}

export function isSameDay(a, b) {
  return dateKey(a) === dateKey(b);
}

export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// e.g. "Nov 9 – Nov 15, 2026"
export function weekLabel(key) {
  const start = parseKey(key);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}, ${end.getFullYear()}`;
}

// ISO -> 'HH:MM' for <input type="time">
export function toTimeInput(iso) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// e.g. "9:00 AM – 10:30 AM" or "9:00 AM"
export function formatTimeRange(startIso, endIso) {
  const f = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return endIso ? `${f(startIso)} – ${f(endIso)}` : f(startIso);
}

// e.g. "Friday, January 14"
export function formatLongDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
