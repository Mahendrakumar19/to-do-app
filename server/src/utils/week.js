const pad = (n) => String(n).padStart(2, '0');

// Returns the local Monday (00:00) of the week containing `date`. Weeks run Monday to Sunday.
function getWeekStart(date) {
  const d = new Date(date);
  const offsetToMonday = (d.getDay() + 6) % 7; // Mon=0 ... Sun=6
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offsetToMonday);
}

// Returns a 'YYYY-MM-DD' key for the Monday that starts the week containing `date`.
function weekKey(date) {
  const start = getWeekStart(date);
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
}

module.exports = { getWeekStart, weekKey };
