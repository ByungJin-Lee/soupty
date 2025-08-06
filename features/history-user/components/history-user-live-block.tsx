"use client";

import React, { useMemo } from "react";
import useSWR from "swr";
import { useAutoScroll } from "~/features/chat";
import { SimplifiedUserLogEntry } from "~/services/ipc/types";
import { useLiveHistoryUserLogs } from "../hooks/use-live-history-user-logs";
import { searchUserLogs } from "../utils/search";
import { HistoryUserLogRow } from "./history-user-log-row";
import { HistoryUserSeparator } from "./history-user-separator";

interface HistoryUserLiveBlockProps {
  today: string;
  userId: string;
  channelId: string;
}

export const HistoryUserLiveBlock: React.FC<HistoryUserLiveBlockProps> = ({
  today,
  userId,
  channelId,
}) => {
  const liveLogs = useLiveHistoryUserLogs(userId, channelId);
  const { data: histories } = useSWR("/history-user-live", () =>
    searchUserLogs(userId, channelId, today)
  );

  const logs = useMemo<SimplifiedUserLogEntry[]>(() => {
    const temp = histories ? histories.logs : [];
    const duplicateChecker = new Set(temp.map((v) => v.id));
    return temp.concat(liveLogs.filter((v) => !duplicateChecker.has(v.id)));
  }, [liveLogs, histories]);

  const { scrollAnchorRef } = useAutoScroll(logs.length, {
    threshold: 100,
    behavior: "instant",
  });

  return (
    <>
      <div className="">
        <HistoryUserSeparator title={today} />

        {logs.map((log) => (
          <HistoryUserLogRow key={`${log.logType}-${log.id}`} userLog={log} />
        ))}
      </div>
      <div ref={scrollAnchorRef}></div>
    </>
  );
};
