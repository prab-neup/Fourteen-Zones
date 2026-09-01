import type { Booking } from '../../types/booking';
import { BookingStatus } from '../../types/booking';
import type { Customer } from '../../types/customer';
import type { Service } from '../../types/service';
import { CATALOG_CUSTOMERS, CATALOG_SERVICES } from './data/catalog';

type MockStore = {
  services: Service[];
  customers: Customer[];
  bookings: Booking[];
  bookingSeq: number;
};

function clone<T>(value: T): T {
  return structuredClone(value);
}

/**
 * Seed one confirmed booking three days out at 09:00 local.
 * That slot is then a real conflict without needing the demo scenario switch.
 */
function createSeedBookings(services: Service[], customers: Customer[]): Booking[] {
  const service = services[0];
  const customer = customers[0];
  const address = customer.addresses[0];
  const start = new Date();
  start.setDate(start.getDate() + 3);
  start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + service.durationMinutes * 60_000);

  return [
    {
      id: 'bkg_2001',
      bookingNumber: 'DM-20481',
      serviceId: service.id,
      serviceName: service.name,
      providerName: service.provider.name,
      customerId: customer.id,
      customerName: customer.name,
      addressId: address.id,
      addressSummary: `${address.label} — ${address.line1}, ${address.city}`,
      scheduledStart: start.toISOString(),
      scheduledEnd: end.toISOString(),
      status: BookingStatus.Confirmed,
      totalPrice: service.price,
      currency: service.currency,
      createdAt: new Date().toISOString(),
    },
  ];
}

function createInitialStore(): MockStore {
  const services = clone(CATALOG_SERVICES);
  const customers = clone(CATALOG_CUSTOMERS);
  const bookings = createSeedBookings(services, customers);

  return {
    services,
    customers,
    bookings,
    bookingSeq: 2001,
  };
}

let store = createInitialStore();

export function getStore(): MockStore {
  return store;
}

export function resetStore(): void {
  store = createInitialStore();
}

export function nextBookingId(): string {
  store.bookingSeq += 1;
  return `bkg_${store.bookingSeq}`;
}

export function nextBookingNumber(): string {
  return `DM-${20480 + store.bookings.length + 1}`;
}

export function addBooking(booking: Booking): Booking {
  store.bookings = [...store.bookings, booking];
  return booking;
}

export function findService(id: string): Service | undefined {
  return store.services.find((service) => service.id === id);
}

export function findCustomer(id: string): Customer | undefined {
  return store.customers.find((customer) => customer.id === id);
}

export function findBooking(id: string): Booking | undefined {
  return store.bookings.find((booking) => booking.id === id);
}

export function hasBookingForSlot(serviceId: string, scheduledStart: string): boolean {
  return store.bookings.some(
    (booking) =>
      booking.serviceId === serviceId &&
      booking.scheduledStart === scheduledStart &&
      booking.status !== BookingStatus.Cancelled,
  );
}
