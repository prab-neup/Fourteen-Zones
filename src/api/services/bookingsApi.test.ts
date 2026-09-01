import { describe, expect, it } from 'vitest';
import { ApiError } from '../client';
import { MockScenario, setMockScenario } from '../mock';
import { createBooking } from './bookingsApi';
import { getServiceAvailability } from './servicesApi';
import { toDateOnly } from '../../lib/format';

async function firstOpenSlot(serviceId = 'svc_1001') {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const availability = await getServiceAvailability(serviceId, {
    date: toDateOnly(date),
  });
  const slot = availability.slots.find((item) => item.available);
  if (!slot) {
    throw new Error('Expected an open slot for tests');
  }
  return slot;
}

describe('createBooking', () => {
  it('rejects incomplete requests with field details', async () => {
    try {
      await createBooking({
        serviceId: '',
        customerId: '',
        addressId: '',
        scheduledStart: '',
      });
      throw new Error('expected validation error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ status: 422, code: 'VALIDATION_ERROR' });
      if (error instanceof ApiError) {
        const fields = error.details?.map((detail) => detail.field) ?? [];
        expect(fields).toEqual(
          expect.arrayContaining(['serviceId', 'customerId', 'addressId', 'scheduledStart']),
        );
      }
    }
  });

  it('rejects an address that does not belong to the customer', async () => {
    const slot = await firstOpenSlot();

    await expect(
      createBooking({
        serviceId: 'svc_1001',
        customerId: 'cus_01',
        addressId: 'addr_11',
        scheduledStart: slot.start,
      }),
    ).rejects.toMatchObject({
      status: 422,
      code: 'VALIDATION_ERROR',
    });
  });

  it('creates a confirmed booking from an open slot', async () => {
    const slot = await firstOpenSlot();

    const booking = await createBooking({
      serviceId: 'svc_1001',
      customerId: 'cus_01',
      addressId: 'addr_01',
      scheduledStart: slot.start,
    });

    expect(booking.serviceName).toBe('Deep home cleaning');
    expect(booking.customerName).toBe('Maya Chen');
    expect(booking.status).toBe('confirmed');
    expect(booking.bookingNumber).toMatch(/^DM-/);
    expect(booking.scheduledStart).toBe(slot.start);
    expect(booking.totalPrice).toBe(8500);
  });

  it('returns SLOT_UNAVAILABLE when the same slot is booked twice', async () => {
    const slot = await firstOpenSlot();
    const body = {
      serviceId: 'svc_1001',
      customerId: 'cus_01',
      addressId: 'addr_01',
      scheduledStart: slot.start,
    };

    await createBooking(body);

    await expect(createBooking(body)).rejects.toMatchObject({
      status: 409,
      code: 'SLOT_UNAVAILABLE',
    });
  });

  it('returns a conflict when the mock scenario forces one', async () => {
    setMockScenario(MockScenario.Conflict);
    const slot = await firstOpenSlot();

    await expect(
      createBooking({
        serviceId: 'svc_1001',
        customerId: 'cus_01',
        addressId: 'addr_01',
        scheduledStart: slot.start,
      }),
    ).rejects.toMatchObject({
      status: 409,
      code: 'SLOT_UNAVAILABLE',
    });
  });
});
