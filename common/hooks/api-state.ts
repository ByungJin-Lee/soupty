import { useCallback, useState } from "react";

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type ApiActions<T> = {
  execute: () => Promise<void>;
  reset: () => void;
  setData: (data: T | null) => void;
};

export const useApiState = <T>(
  fetcher: () => Promise<T>
): ApiState<T> & ApiActions<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    setData,
  };
};