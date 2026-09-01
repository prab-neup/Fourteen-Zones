export const BookingStatus = {
  Confirmed: 'confirmed',
  Cancelled: 'cancelled',
  Completed: 'completed',
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export type Booking = {
  id: string;
  bookingNumber: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  customerId: string;
  customerName: string;
  addressId: string;
  addressSummary: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  createdAt: string;
};

export type CreateBookingRequest = {
  serviceId: string;
  customerId: string;
  addressId: string;
  scheduledStart: string;
};
