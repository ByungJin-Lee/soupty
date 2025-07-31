"use client";

import { PropsWithChildren, useState } from "react";
import { PaginationContextProvider } from "../context/pagination";

export const PaginationProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20 });

  const setPage = (value: number) =>
    setPagination((p) => ({ ...p, page: value }));

  // pageSize가 변경되면 page를 초기화
  const setPageSize = (value: number) =>
    setPagination({ page: 1, pageSize: value });

  return (
    <PaginationContextProvider
      value={{
        ...pagination,
        setPage,
        setPageSize,
      }}
    >
      {children}
    </PaginationContextProvider>
  );
};
