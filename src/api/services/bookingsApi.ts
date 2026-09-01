import type { CollectionMeta } from '../../types/api';
import type { Booking, BookingStatus, CreateBookingRequest } from '../../types/booking';
import { httpClient } from '../client/createHttpClient';

export type GetBookingsParams = {
  status?: BookingStatus;
};

export type BookingListResult = {
  items: Booking[];
  meta: CollectionMeta;
};

export async function getBookings(
  params: GetBookingsParams = {},
): Promise<BookingListResult> {
  const envelope = await httpClient.requestEnvelope<Booking[], CollectionMeta>({
    method: 'GET',
    path: '/api/v1/bookings',
    query: { status: params.status },
  });

  return {
    items: envelope.data,
    meta: envelope.meta ?? { total: envelope.data.length },
  };
}

export function getBooking(bookingId: string): Promise<Booking> {
  return httpClient.request<Booking>({
    method: 'GET',
    path: `/api/v1/bookings/${bookingId}`,
  });
}

export function createBooking(body: CreateBookingRequest): Promise<Booking> {
  return httpClient.request<Booking>({
    method: 'POST',
    path: '/api/v1/bookings',
    body,
  });
}
