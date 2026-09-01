import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { formatDateTime } from '../../lib/format';
import { useBookings } from './useBookings';

export function MyBookingsPage() {
  const list = useBookings();

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">Account</p>
          <h1>My bookings</h1>
          <p className="lede">Confirmed visits for this session’s mock customer history.</p>
        </div>
      </div>

      {list.status === 'loading' ? <LoadingState label="Loading bookings" count={3} /> : null}

      {list.status === 'error' ? (
        <ErrorState
          title="Bookings could not be loaded"
          message={list.error ?? 'Please try again.'}
          onRetry={list.reload}
        />
      ) : null}

      {list.status === 'empty' ? (
        <EmptyState
          title="No bookings yet"
          description="When you confirm a service, it will show up here."
          action={
            <Link className="button" to="/">
              Browse services
            </Link>
          }
        />
      ) : null}

      {list.status === 'success' ? (
        <div className="choice-list">
          {list.bookings.map((booking) => (
            <Link className="choice" key={booking.id} to={`/bookings/${booking.id}`}>
              <strong>
                {booking.bookingNumber} · {booking.serviceName}
              </strong>
              <span className="muted">
                {booking.providerName} · {formatDateTime(booking.scheduledStart)}
              </span>
              <span className={`badge ${booking.status}`}>{booking.status}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
