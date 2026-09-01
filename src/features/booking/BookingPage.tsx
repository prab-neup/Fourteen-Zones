import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { formatMoney } from '../../lib/format';
import { BookingSummary } from './BookingSummary';
import { CustomerStep } from './CustomerStep';
import { DateTimeStep } from './DateTimeStep';
import { useBooking } from './useBooking';

const STEP_LABELS = {
  datetime: 'Date & time',
  customer: 'Customer',
  confirm: 'Confirm',
} as const;

export function BookingPage() {
  const booking = useBooking();

  if (booking.loadStatus === 'loading') {
    return <LoadingState variant="detail" label="Loading booking" />;
  }

  if (booking.loadStatus === 'error' || !booking.service) {
    return (
      <ErrorState
        title="Booking cannot start"
        message={booking.loadError ?? 'The service could not be loaded.'}
        onRetry={booking.reload}
      />
    );
  }

  if (!booking.serviceBookable) {
    return (
      <ErrorState
        title="This service is unavailable"
        message="The catalog marks this service as unavailable, so it cannot be booked."
      />
    );
  }

  return (
    <section>
      <p className="eyebrow">
        <Link to={`/services/${booking.service.id}`}>{booking.service.name}</Link>
        {' / '}
        Book
      </p>
      <div className="page-head">
        <div>
          <h1>Schedule your visit</h1>
          <p className="lede">
            {booking.service.provider.name} ·{' '}
            {formatMoney(booking.service.price, booking.service.currency)}
          </p>
        </div>
      </div>

      <ol className="steps">
        {(Object.keys(STEP_LABELS) as Array<keyof typeof STEP_LABELS>).map((key) => (
          <li key={key} className={booking.step === key ? 'active' : ''}>
            {STEP_LABELS[key]}
          </li>
        ))}
      </ol>

      <div className="details">
        <article className="details-hero">
          {booking.step === 'datetime' ? (
            <DateTimeStep
              date={booking.date}
              slots={booking.slots}
              slotsStatus={booking.slotsStatus}
              slotsError={booking.slotsError}
              selectedStart={booking.selectedSlot?.start ?? null}
              fieldError={booking.fieldErrors.scheduledStart}
              conflictMessage={booking.conflictMessage}
              onSelectDate={booking.selectDate}
              onSelectSlot={booking.selectSlot}
            />
          ) : null}

          {booking.step === 'customer' ? (
            <CustomerStep
              customers={booking.customers}
              addresses={booking.addresses}
              customerId={booking.customerId}
              addressId={booking.addressId}
              customerError={booking.fieldErrors.customerId}
              addressError={booking.fieldErrors.addressId}
              onSelectCustomer={booking.selectCustomer}
              onSelectAddress={booking.selectAddress}
            />
          ) : null}

          {booking.step === 'confirm' ? (
            <div className="stack">
              <p className="eyebrow">Summary</p>
              <h2>Review and confirm</h2>
              <BookingSummary
                service={booking.service}
                slot={booking.selectedSlot}
                customer={booking.selectedCustomer}
                address={booking.selectedAddress}
              />
              {booking.submitError ? (
                <p className="banner danger" role="alert">
                  {booking.submitError}
                </p>
              ) : null}
            </div>
          ) : null}
        </article>

        <aside className="details-aside stack">
          {booking.step === 'datetime' ? (
            <Button type="button" onClick={booking.goToCustomer}>
              Continue
            </Button>
          ) : null}
          {booking.step === 'customer' ? (
            <>
              <Button type="button" onClick={booking.goToConfirm}>
                Review booking
              </Button>
              <Button type="button" variant="ghost" onClick={() => booking.setStep('datetime')}>
                Back
              </Button>
            </>
          ) : null}
          {booking.step === 'confirm' ? (
            <>
              <Button type="button" onClick={booking.submit} disabled={booking.submitting}>
                {booking.submitting ? 'Confirming…' : 'Confirm booking'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => booking.setStep('customer')}>
                Back
              </Button>
            </>
          ) : null}
          <Link className="muted" to={`/services/${booking.service.id}`}>
            Cancel
          </Link>
        </aside>
      </div>
    </section>
  );
}
