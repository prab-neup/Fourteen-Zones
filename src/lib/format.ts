import type { ServiceAvailability, ServiceCategory } from '../types/service';

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  cleaning: 'Cleaning',
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  wellness: 'Wellness',
  tutoring: 'Tutoring',
  moving: 'Moving',
};

const AVAILABILITY_LABELS: Record<ServiceAvailability, string> = {
  available: 'Available',
  limited: 'Limited slots',
  unavailable: 'Unavailable',
};

export function formatCategory(category: ServiceCategory): string {
  return CATEGORY_LABELS[category];
}

export function formatAvailability(value: ServiceAvailability): string {
  return AVAILABILITY_LABELS[value];
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours} hr` : `${hours} hr ${remainder} min`;
}

export function formatRating(rating: number, reviewCount: number): string {
  return `${rating.toFixed(1)} (${reviewCount})`;
}

export function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateOnly: string): string {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function upcomingDates(count = 14): string[] {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return toDateOnly(date);
  });
}
