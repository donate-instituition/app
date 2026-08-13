import { useCallback, useEffect, useRef, useState } from 'react';

type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

type UseFetchResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Generic data-fetching hook.
 *
 * @param fetcher - Async function that returns the data. Must be stable (wrap in useCallback
 *                  or define outside the component) to avoid infinite re-renders.
 *
 * @example
 * const fetcher = useCallback(() => campaignsService.listCampaigns(filters), [filters]);
 * const { data, loading, error, refetch } = useFetch(fetcher);
 */
export function useFetch<T>(fetcher: () => Promise<T>): UseFetchResult<T> {
  const [state, setState] = useState<FetchState<T>>({ status: 'idle' });
  // Track whether the component is still mounted to avoid setState after unmount
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await fetcher();
      if (mountedRef.current) {
        setState({ status: 'success', data });
      }
    } catch (err) {
      if (mountedRef.current) {
        const message =
          err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
        setState({ status: 'error', message });
      }
    }
  }, [fetcher]);

  useEffect(() => {
    mountedRef.current = true;
    void run();
    return () => {
      mountedRef.current = false;
    };
  }, [run]);

  return {
    data: state.status === 'success' ? state.data : null,
    loading: state.status === 'loading' || state.status === 'idle',
    error: state.status === 'error' ? state.message : null,
    refetch: run,
  };
}
