import { formatDateTime, formatDuration, formatMoney } from '../../lib/format';
import type { Address, Customer } from '../../types/customer';
import type { Service, TimeSlot } from '../../types/service';

type BookingSummaryProps = {
  service: Service;
  slot: TimeSlot | null;
  customer: Customer | null;
  address: Address | null;
};

export function BookingSummary({ service, slot, customer, address }: BookingSummaryProps) {
  return (
    <dl className="facts">
      <div className="fact">
        <dt>Service</dt>
        <dd>{service.name}</dd>
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
        <dt>Price</dt>
        <dd>{formatMoney(service.price, service.currency)}</dd>
      </div>
      <div className="fact">
        <dt>When</dt>
        <dd>{slot ? formatDateTime(slot.start) : 'Not selected'}</dd>
      </div>
      <div className="fact">
        <dt>Customer</dt>
        <dd>{customer?.name ?? 'Not selected'}</dd>
      </div>
      <div className="fact">
        <dt>Address</dt>
        <dd>
          {address
            ? `${address.label} — ${address.line1}, ${address.city}`
            : 'Not selected'}
        </dd>
      </div>
    </dl>
  );
}
