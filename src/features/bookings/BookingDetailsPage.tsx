import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { BookingRecord } from './BookingRecord';
import { useBookingDetails } from './useBookingDetails';

export function BookingDetailsPage() {
  const { booking, status, error, reload } = useBookingDetails();

  if (status === 'loading') {
    return <LoadingState variant="detail" label="Loading booking" />;
  }

  if (status === 'error' || !booking) {
    return (
      <ErrorState
        title="Booking not found"
        message={error ?? 'This booking could not be found.'}
        onRetry={reload}
      />
    );
  }

  return (
    <section className="stack">
      <p className="eyebrow">
        <Link to="/bookings">My bookings</Link> / Details
      </p>
      <BookingRecord booking={booking} />
    </section>
  );
}
