// نمایش دقیقه‌ها به شکل «۱ ساعت و ۳۰ دقیقه»
export function formatMinutes(minutes) {
  if (!minutes) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const parts = [];
  if (hours) parts.push(`${hours.toLocaleString('fa-IR')} ساعت`);
  if (rest) parts.push(`${rest.toLocaleString('fa-IR')} دقیقه`);
  return parts.join(' و ');
}

export function formatDate(iso) {
  return new Date(iso).toLocaleString('fa-IR', { dateStyle: 'medium', timeStyle: 'short' });
}
