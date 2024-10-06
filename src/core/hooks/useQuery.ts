import { useCallback, useEffect, useState } from "react";

// Simple in-memory cache
const queryCache: { [key: string]: any } = {};

export const useQuery = <T>(key: string, fetcher: () => Promise<T>, options?: { staleTime?: number }) => {
  const [data, setData] = useState<T | null>(queryCache[key] || null);
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetcher();
      queryCache[key] = result; // Cache result
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher]);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [fetchData, data]);

  // Invalidate cache
  const invalidate = () => {
    delete queryCache[key];
    setData(null);
    fetchData();
  };

  return { data, isLoading, error, invalidate };
};
