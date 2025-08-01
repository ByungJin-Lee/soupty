import { PropsWithChildren, useEffect, useState } from "react";
import ipcService from "~/services/ipc";
import {
  BroadcastSessionSearchFilters,
  BroadcastSessionSearchResult,
  PaginationParams,
} from "~/services/ipc/types";
import { BroadcastSessionSearchContextProvider } from "../context/broadcast-session-search-context";

export const BroadcastSessionSearchProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const [result, setResult] = useState<BroadcastSessionSearchResult | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const search = async (
    filters: BroadcastSessionSearchFilters,
    pagination: PaginationParams
  ) => {
    setLoading(true);
    try {
      const searchResult =
        await ipcService.broadcastSession.searchBroadcastSessions(
          filters,
          pagination
        );
      setResult(searchResult);
    } catch (error) {
      console.error("Failed to search broadcast sessions:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 초기 데이터 가져오기
    search({}, { page: 1, pageSize: 20 });
  }, []);

  return (
    <BroadcastSessionSearchContextProvider
      value={{
        result,
        loading,
        search,
      }}
    >
      {children}
    </BroadcastSessionSearchContextProvider>
  );
};
