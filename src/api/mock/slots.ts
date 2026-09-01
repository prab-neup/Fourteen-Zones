import type { Service, TimeSlot } from '../../types/service';
import { ServiceAvailability } from '../../types/service';
import { hasBookingForSlot } from './store';

const SLOT_HOURS = [9, 11, 13, 15];
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value: string): boolean {
  if (!DATE_ONLY.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function datePartFromIso(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function slotStart(date: string, hour: number): Date {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

/**
 * Slots are generated per calendar day from the service duration.
 * Occupied or past starts are marked unavailable so the UI can disable them
 * instead of hiding the times (matches the contract).
 */
export function buildSlotsForDate(service: Service, date: string): TimeSlot[] {
  if (service.availability === ServiceAvailability.Unavailable) {
    return [];
  }

  const now = Date.now();

  return SLOT_HOURS.map((hour) => {
    const start = slotStart(date, hour);
    const end = new Date(start.getTime() + service.durationMinutes * 60_000);
    const startIso = start.toISOString();
    const taken = hasBookingForSlot(service.id, startIso);
    const inPast = start.getTime() <= now;
    const limitedLastSlot =
      service.availability === ServiceAvailability.Limited && hour === 15;

    return {
      start: startIso,
      end: end.toISOString(),
      available: !taken && !inPast && !limitedLastSlot,
    };
  });
}

export function findOpenSlot(service: Service, scheduledStart: string): TimeSlot | undefined {
  const date = datePartFromIso(scheduledStart);
  if (!isValidDateOnly(date)) {
    return undefined;
  }

  return buildSlotsForDate(service, date).find(
    (slot) => slot.start === scheduledStart && slot.available,
  );
}
