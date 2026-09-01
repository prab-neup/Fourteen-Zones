import { Link } from 'react-router-dom';
import {
  formatAvailability,
  formatCategory,
  formatDuration,
  formatMoney,
  formatRating,
} from '../../lib/format';
import type { Service } from '../../types/service';

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link className="card" to={`/services/${service.id}`}>
      <div className="card-top">
        <span className="badge">{formatCategory(service.category)}</span>
        <span className={`badge ${service.availability}`}>
          {formatAvailability(service.availability)}
        </span>
      </div>
      <h3>{service.name}</h3>
      <p className="muted">{service.provider.name}</p>
      <div className="card-meta">
        <span className="price">{formatMoney(service.price, service.currency)}</span>
        <span className="muted">
          {formatDuration(service.durationMinutes)} · {formatRating(service.rating, service.reviewCount)}
        </span>
      </div>
    </Link>
  );
}
