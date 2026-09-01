import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { getService } from '../../api/services';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';
import type { Service } from '../../types/service';

export function useServiceDetails() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    if (!serviceId) {
      setStatus('error');
      setError('Service id is missing.');
      return;
    }

    let cancelled = false;
    setStatus('loading');
    setError(null);

    getService(serviceId)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setService(result);
        setStatus('success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setService(null);
        setError(isApiError(reason) ? reason.message : 'Unable to load this service.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [serviceId, reloadTick]);

  return {
    serviceId,
    service,
    status,
    error,
    reload: () => setReloadTick((value) => value + 1),
  };
}
