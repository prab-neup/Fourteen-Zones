import { formatDateTime, formatMoney } from '../../lib/format';
import type { Booking } from '../../types/booking';

export function BookingRecord({ booking }: { booking: Booking }) {
  return (
    <article className="details-hero">
      <p className="eyebrow">{booking.bookingNumber}</p>
      <h1>{booking.serviceName}</h1>
      <dl className="facts">
        <div className="fact">
          <dt>Provider</dt>
          <dd>{booking.providerName}</dd>
        </div>
        <div className="fact">
          <dt>Scheduled</dt>
          <dd>{formatDateTime(booking.scheduledStart)}</dd>
        </div>
        <div className="fact">
          <dt>Status</dt>
          <dd className={`badge ${booking.status}`}>{booking.status}</dd>
        </div>
        <div className="fact">
          <dt>Customer</dt>
          <dd>{booking.customerName}</dd>
        </div>
        <div className="fact">
          <dt>Address</dt>
          <dd>{booking.addressSummary}</dd>
        </div>
        <div className="fact">
          <dt>Total</dt>
          <dd>{formatMoney(booking.totalPrice, booking.currency)}</dd>
        </div>
      </dl>
    </article>
  );
}
