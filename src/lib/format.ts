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
