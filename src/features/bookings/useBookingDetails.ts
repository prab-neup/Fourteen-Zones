import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { getBooking } from '../../api/services';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';
import type { Booking } from '../../types/booking';

export function useBookingDetails() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!bookingId) {
      setStatus('error');
      setError('Booking id is missing.');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    getBooking(bookingId)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setBooking(result);
        setStatus('success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setBooking(null);
        setError(isApiError(reason) ? reason.message : 'Unable to load this booking.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, reloadTick]);

  return {
    bookingId,
    booking,
    status,
    error,
    reload: () => setReloadTick((value) => value + 1),
  };
}
