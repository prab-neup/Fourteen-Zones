import { Link, useParams } from 'react-router-dom';

export function BookingPage() {
  const { serviceId } = useParams<{ serviceId: string }>();

  return (
    <section className="state-panel">
      <p className="eyebrow">Next step</p>
      <h1>Booking flow</h1>
      <p className="muted">
        Date, time, customer, and confirm will be built next. Service {serviceId} is
        ready to book.
      </p>
      <p>
        <Link to={`/services/${serviceId}`}>Back to service</Link>
      </p>
    </section>
  );
}
