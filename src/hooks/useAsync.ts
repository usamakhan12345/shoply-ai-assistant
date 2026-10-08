import { useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage } from '@/services/http';

/** Run an async loader whenever `deps` change; exposes data / loading / error / reload.
 *  Stale responses (from an older request) are ignored. */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const run = useRef(0);

  const load = useCallback(() => {
    const id = ++run.current;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => run.current === id && setData(d))
      .catch((e) => run.current === id && setError(errorMessage(e)))
      .finally(() => run.current === id && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(load, [load]);
  return { data, loading, error, reload: load, setData };
}
