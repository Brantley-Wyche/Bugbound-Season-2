const time = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit',
});
const monthDay = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});
const monthDayYear = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatTime(at: number) {
  return time.format(at);
}

/** "today", "Sep 24", or "Sep 24, 2025" when the year differs. */
export function formatDay(at: number, now = Date.now()) {
  const day = new Date(at);
  const today = new Date(now);
  if (day.toDateString() === today.toDateString()) return 'today';
  return day.getFullYear() === today.getFullYear()
    ? monthDay.format(day)
    : monthDayYear.format(day);
}

export function bugId(number: number) {
  return `BUG-${String(number).padStart(3, '0')}`;
}

export function folio(number: number) {
  return String(number).padStart(2, '0');
}
