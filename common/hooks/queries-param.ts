import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

type QueryActions<T> = {
  setValue: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
  setAll: (values: Partial<T>) => void;
  reset: () => void;
};

export function useQueriesParam<T extends Record<string, unknown>>(
  root: string,
  defaultValues: T
): [T, QueryActions<T>] {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 현재 값들을 가져옴 (URL 우선, 기본값 fallback)
  const currentValues = useMemo(() => {
    const values = {} as T;
    for (const key in defaultValues) {
      const urlValue = searchParams.get(key);
      const defaultValue = defaultValues[key];

      if (urlValue) {
        values[key] = urlValue as T[Extract<keyof T, string>];
      } else {
        values[key] = defaultValue as T[Extract<keyof T, string>];
      }
    }
    return values;
  }, [searchParams, defaultValues]);

  // URL 업데이트 함수
  const updateURL = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (
          value !== undefined &&
          value !== null &&
          value !== defaultValues[key]
        ) {
          // 다양한 타입을 문자열로 변환
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams, defaultValues]
  );

  // 액션 함수들 생성
  const actions = useMemo<QueryActions<T>>(
    () => ({
      setValue: <K extends keyof T>(key: K, value: T[K] | undefined) => {
        updateURL({ [key]: value } as Partial<T>);
      },
      setAll: (values: Partial<T>) => {
        updateURL(values);
      },
      reset: () => {
        router.push(root);
      },
    }),
    [updateURL, router, root]
  );

  return [currentValues, actions];
}
