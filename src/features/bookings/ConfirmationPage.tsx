import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { BookingRecord } from './BookingRecord';
import { useBookingDetails } from './useBookingDetails';

export function ConfirmationPage() {
  const { booking, status, error, reload } = useBookingDetails();

  if (status === 'loading') {
    return <LoadingState variant="detail" label="Loading confirmation" />;
  }

  if (status === 'error' || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        message={error ?? 'The confirmation could not be loaded.'}
        onRetry={reload}
      />
    );
  }

  return (
    <section className="stack">
      <p className="banner success" role="status">
        Booking confirmed. Your number is {booking.bookingNumber}.
      </p>
      <BookingRecord booking={booking} />
      <div className="chips">
        <Link className="button" to="/bookings">
          View my bookings
        </Link>
        <Link className="button ghost" to="/">
          Book another service
        </Link>
      </div>
    </section>
  );
}
