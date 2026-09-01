import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isApiError } from '../../api/client';
import { getServices } from '../../api/services';
import type { AsyncStatus } from '../../hooks/useAsyncStatus';
import type { Service } from '../../types/service';
import { ServiceCategory as ServiceCategoryValue } from '../../types/service';

const CATEGORIES = Object.values(ServiceCategoryValue);

export function useServiceList() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';

  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    getServices({
      q: q || undefined,
      category: category || undefined,
    })
      .then((result) => {
        if (cancelled) {
          return;
        }
        setServices(result.items);
        setStatus(result.items.length === 0 ? 'empty' : 'success');
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }
        setServices([]);
        setError(isApiError(reason) ? reason.message : 'Unable to load services.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [q, category, reloadTick]);

  const setQuery = useCallback(
    (next: string) => {
      setParams((current) => {
        const copy = new URLSearchParams(current);
        if (next) {
          copy.set('q', next);
        } else {
          copy.delete('q');
        }
        return copy;
      }, { replace: true });
    },
    [setParams],
  );

  const setCategory = useCallback(
    (next: string) => {
      setParams((current) => {
        const copy = new URLSearchParams(current);
        if (next) {
          copy.set('category', next);
        } else {
          copy.delete('category');
        }
        return copy;
      }, { replace: true });
    },
    [setParams],
  );

  const reload = useCallback(() => {
    setReloadTick((value) => value + 1);
  }, []);

  return {
    q,
    category,
    categories: CATEGORIES,
    status,
    services,
    error,
    setQuery,
    setCategory,
    reload,
    hasFilters: Boolean(q || category),
  };
}
