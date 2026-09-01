import { useEffect, useState } from 'react';

/** Keeps typing snappy while the URL/API only update after the user pauses. */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = globalThis.setTimeout(() => setDebounced(value), delayMs);
    return () => globalThis.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
