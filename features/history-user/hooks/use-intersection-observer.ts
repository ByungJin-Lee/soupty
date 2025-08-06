import { useEffect, useRef } from "react";

interface UseIntersectionObserverOptions {
  onIntersect: () => void;
  enabled: boolean;
  rootMargin?: string;
  threshold?: number;
  maintainScrollPosition?: boolean;
}

export const useIntersectionObserver = ({
  onIntersect,
  enabled,
  rootMargin = "100px 0px",
  threshold = 0.1,
  maintainScrollPosition = false,
}: UseIntersectionObserverOptions) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    const target = targetRef.current;
    const root = rootRef.current;
    if (!target || !enabled || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // 스크롤 위치 유지를 위해 현재 높이 저장
          if (maintainScrollPosition) {
            previousScrollHeightRef.current = root.scrollHeight;
          }

          onIntersect();
        }
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
    };
  }, [onIntersect, enabled, rootMargin, threshold, maintainScrollPosition]);

  // 스크롤 위치 유지 로직
  useEffect(() => {
    if (!maintainScrollPosition) return;

    const root = rootRef.current;
    if (!root) return;

    const currentScrollHeight = root.scrollHeight;
    const previousScrollHeight = previousScrollHeightRef.current;

    if (
      previousScrollHeight > 0 &&
      currentScrollHeight > previousScrollHeight
    ) {
      const addedHeight = currentScrollHeight - previousScrollHeight;
      root.scrollTop = root.scrollTop + addedHeight;
    }
  });

  return { targetRef, rootRef };
};
