"use client";

import React from "react";
import { LogBlock } from "../types/log";
import { HistoryUserLogRow } from "./history-user-log-row";
import { HistoryUserSeparator } from "./history-user-separator";

interface HistoryUserPastBlockProps {
  block: LogBlock;
}

export const HistoryUserPastBlock: React.FC<HistoryUserPastBlockProps> = ({
  block,
}) => {
  return (
    <div className="">
      <HistoryUserSeparator title={block.date} />
      <div>
        {block.logs.map((userLog) => (
          <HistoryUserLogRow
            key={`${userLog.logType}-${userLog.id}`}
            userLog={userLog}
          />
        ))}
      </div>
    </div>
  );
};
