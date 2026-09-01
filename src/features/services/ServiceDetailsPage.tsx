import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import {
  formatAvailability,
  formatCategory,
  formatDuration,
  formatMoney,
  formatRating,
} from '../../lib/format';
import { ServiceAvailability } from '../../types/service';
import { useServiceDetails } from './useServiceDetails';

export function ServiceDetailsPage() {
  const { service, status, error, reload } = useServiceDetails();

  if (status === 'loading') {
    return <LoadingState variant="detail" label="Loading service" />;
  }

  if (status === 'error' || !service) {
    return (
      <ErrorState
        title="Service not available"
        message={error ?? 'This service could not be found.'}
        onRetry={reload}
      />
    );
  }

  const canBook = service.availability !== ServiceAvailability.Unavailable;

  return (
    <section>
      <p className="eyebrow">
        <Link to="/">Services</Link> / {formatCategory(service.category)}
      </p>
      <div className="details">
        <article className="details-hero">
          <h1>{service.name}</h1>
          <p className="lede">{service.description}</p>
          <dl className="facts">
            <div className="fact">
              <dt>Category</dt>
              <dd>{formatCategory(service.category)}</dd>
            </div>
            <div className="fact">
              <dt>Provider</dt>
              <dd>{service.provider.name}</dd>
            </div>
            <div className="fact">
              <dt>Duration</dt>
              <dd>{formatDuration(service.durationMinutes)}</dd>
            </div>
            <div className="fact">
              <dt>Rating</dt>
              <dd>{formatRating(service.rating, service.reviewCount)}</dd>
            </div>
            <div className="fact">
              <dt>Availability</dt>
              <dd>{formatAvailability(service.availability)}</dd>
            </div>
            <div className="fact">
              <dt>Currency</dt>
              <dd>{service.currency}</dd>
            </div>
          </dl>
        </article>
        <aside className="details-aside stack">
          <p className="muted">From</p>
          <p className="aside-price">{formatMoney(service.price, service.currency)}</p>
          {canBook ? (
            <Link className="button" to={`/services/${service.id}/book`}>
              Book this service
            </Link>
          ) : (
            <Button type="button" disabled>
              Currently unavailable
            </Button>
          )}
          <Link to="/" className="muted">
            Back to catalog
          </Link>
        </aside>
      </div>
    </section>
  );
}
