export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} DT`;
}

export function formatDuration(minutes: number, locale: string): string {
  if (locale === 'derja') {
    return `${minutes} دقيقة`;
  }
  return `${minutes} min`;
}

export function formatDate(date: string | Date, locale: string): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === 'derja' ? 'ar-TN' : 'fr-TN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  return `${h > 12 ? h - 12 : h}:${minutes} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  let current = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  while (current < endMin) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    current += intervalMinutes;
  }
  return slots;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'WAITING':
      return 'bg-yellow-100 text-yellow-800';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'bg-red-100 text-red-800';
    case 'CONFIRMED':
      return 'bg-emerald-100 text-emerald-800';
    case 'PENDING':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
