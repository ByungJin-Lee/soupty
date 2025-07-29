import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

export function useQueryParam<T extends string>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentValue = (searchParams.get(key) as T) || defaultValue;

  const setValue = useCallback(
    (value: T) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.push(`?${params.toString()}`);
    },
    [key, router, searchParams]
  );

  return [currentValue, setValue];
}