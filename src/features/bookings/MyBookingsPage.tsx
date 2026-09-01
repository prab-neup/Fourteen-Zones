import { Link } from 'react-router-dom';

export function MyBookingsPage() {
  return (
    <section className="state-panel">
      <p className="eyebrow">Next step</p>
      <h1>My Bookings</h1>
      <p className="muted">This list will load from GET /api/v1/bookings after the booking flow.</p>
      <p>
        <Link to="/">Browse services</Link>
      </p>
    </section>
  );
}
