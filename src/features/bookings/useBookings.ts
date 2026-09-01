import { useEffect, useState } from 'react';
import { isApiError } from '../../api/client';
import { getBookings } from '../../api/services';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';
import type { Booking } from '../../types/booking';

export function useBookings() {
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    getBookings()
      .then((result) => {
        if (cancelled) {
          return;
        }
        setBookings(result.items);
        setStatus(result.items.length === 0 ? 'empty' : 'success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setBookings([]);
        setError(isApiError(reason) ? reason.message : 'Unable to load bookings.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadTick]);

  return {
    status,
    bookings,
    error,
    reload: () => setReloadTick((value) => value + 1),
  };
}
