import type { Booking, CreateBookingRequest } from '../../../types/booking';
import { BookingStatus } from '../../../types/booking';
import { ErrorCode } from '../../../types/api';
import { ServiceAvailability } from '../../../types/service';
import type { FieldError } from '../../../types/api';
import type { MockRequest, MockResult } from '../http';
import {
  created,
  fail,
  notFound,
  ok,
  readString,
  serverError,
  validationError,
} from '../http';
import { MockScenario } from '../scenario';
import { findOpenSlot } from '../slots';
import {
  addBooking,
  findBooking,
  findCustomer,
  findService,
  getStore,
  hasBookingForSlot,
  nextBookingId,
  nextBookingNumber,
} from '../store';

const BOOKING_STATUSES = new Set<string>(Object.values(BookingStatus));

export function listBookings(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  const status = req.query.status;
  if (status && !BOOKING_STATUSES.has(status)) {
    return validationError([
      { field: 'status', message: 'status must be confirmed, cancelled, or completed' },
    ]);
  }

  if (req.scenario === MockScenario.Empty) {
    return ok([], { total: 0 });
  }

  const items = status
    ? getStore().bookings.filter((booking) => booking.status === status)
    : getStore().bookings;

  return ok(items, { total: items.length });
}

export function getBookingById(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  const booking = findBooking(req.params.booking_id);
  if (!booking) {
    return notFound('Booking not found.');
  }

  return ok(booking);
}

export function createBooking(req: MockRequest): MockResult {
  if (req.scenario === MockScenario.ServerError) {
    return serverError();
  }

  if (req.scenario === MockScenario.ValidationError) {
    return validationError([
      { field: 'scheduledStart', message: 'Date and time are required' },
      { field: 'addressId', message: 'Address is required' },
    ]);
  }

  if (req.scenario === MockScenario.Conflict) {
    return fail(
      409,
      ErrorCode.SlotUnavailable,
      'The selected time slot is no longer available.',
    );
  }

  const details = validateCreateBody(req.body);
  if (details.length > 0) {
    return validationError(details);
  }

  const body = req.body as CreateBookingRequest;
  const service = findService(body.serviceId);
  const customer = findCustomer(body.customerId);

  if (!service) {
    return notFound('Service not found.');
  }

  if (!customer) {
    return notFound('Customer not found.');
  }

  const address = customer.addresses.find((item) => item.id === body.addressId);
  if (!address) {
    return validationError([
      { field: 'addressId', message: 'addressId must belong to the selected customer' },
    ]);
  }

  if (service.availability === ServiceAvailability.Unavailable) {
    return fail(409, ErrorCode.ServiceUnavailable, 'This service cannot be booked.');
  }

  // Slot rules live here, not in React, so a real backend can reuse the same contract.
  if (hasBookingForSlot(service.id, body.scheduledStart) || !findOpenSlot(service, body.scheduledStart)) {
    return fail(
      409,
      ErrorCode.SlotUnavailable,
      'The selected time slot is no longer available.',
    );
  }

  const start = new Date(body.scheduledStart);
  const end = new Date(start.getTime() + service.durationMinutes * 60_000);
  const booking: Booking = {
    id: nextBookingId(),
    bookingNumber: nextBookingNumber(),
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
  };

  return created(addBooking(booking));
}

function validateCreateBody(body: unknown): FieldError[] {
  const details: FieldError[] = [];
  const serviceId = readString(body, 'serviceId');
  const customerId = readString(body, 'customerId');
  const addressId = readString(body, 'addressId');
  const scheduledStart = readString(body, 'scheduledStart');

  if (!serviceId) {
    details.push({ field: 'serviceId', message: 'serviceId is required' });
  }

  if (!customerId) {
    details.push({ field: 'customerId', message: 'customerId is required' });
  }

  if (!addressId) {
    details.push({ field: 'addressId', message: 'addressId is required' });
  }

  if (!scheduledStart) {
    details.push({ field: 'scheduledStart', message: 'Date and time are required' });
    return details;
  }

  const parsed = Date.parse(scheduledStart);
  if (Number.isNaN(parsed)) {
    details.push({
      field: 'scheduledStart',
      message: 'scheduledStart must be an ISO-8601 date-time',
    });
    return details;
  }

  if (parsed <= Date.now()) {
    details.push({ field: 'scheduledStart', message: 'scheduledStart must be in the future' });
  }

  return details;
}
