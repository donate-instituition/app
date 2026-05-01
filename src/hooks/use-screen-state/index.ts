type UseScreenStateParams<TData> = {
  data?: TData | null;
  loading?: boolean;
  error?: unknown;
  success?: boolean;
  isEmpty?: (data: TData) => boolean;
};

export function useScreenState<TData>({
  data,
  error,
  isEmpty,
  loading,
  success,
}: UseScreenStateParams<TData>) {
  const empty = Boolean(!loading && !error && data && isEmpty?.(data));

  return {
    loading: Boolean(loading),
    error: error ? { title: 'Nao foi possivel carregar os dados' } : null,
    empty,
    success: success ? { title: 'Acao realizada com sucesso' } : null,
  };
}
