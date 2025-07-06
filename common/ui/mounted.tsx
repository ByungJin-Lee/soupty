"use client";

import { useEffect, useState } from "react";

export function mounted<T extends React.PropsWithChildren>(
  Component: React.ComponentType<T>
): React.FC<T> {
  const El = (props: T) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return <Component {...props} />;
  };

  return El;
}
