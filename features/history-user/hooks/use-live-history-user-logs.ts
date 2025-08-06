import { emit, once } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import { ipcListener } from "~/common/utils/ipc";
import { EventDisplayUtil } from "~/features/event/utils/event-display";
import { SimplifiedUserLogEntry, UserLogEntry } from "~/services/ipc/types";
import {
  transformChatToLogEntry,
  transformEventToLogEntry,
} from "../utils/entry";
import { historyUserOpenerKey } from "../utils/opener";

export const useLiveHistoryUserLogs = (userId: string, channelId: string) => {
  const [liveLogs, setLiveLogs] = useState<SimplifiedUserLogEntry[]>([]);

  const append = useCallback(
    (log: SimplifiedUserLogEntry) => {
      setLiveLogs((p) => p.concat(log));
    },
    [setLiveLogs]
  );

  useEffect(() => {
    const key = historyUserOpenerKey(userId, channelId);
    once(key + ":data", (e) => {
      if (e.payload) setLiveLogs(e.payload as UserLogEntry[]);
    });
    emit(key);
  }, [userId, channelId]);

  useEffect(() => {
    const chat = ipcListener.listenChat((e) => {
      if (userId === e.user.id) {
        append(transformChatToLogEntry(e));
      }
    });
    const event = ipcListener.listenEvent((e) => {
      if (EventDisplayUtil.extractUser(e).id === userId) {
        append(transformEventToLogEntry(e));
      }
    });

    return () => {
      Promise.all([chat, event]).then(([chat, event]) => {
        chat();
        event();
      });
    };
  }, [userId, append]);

  return liveLogs;
};
