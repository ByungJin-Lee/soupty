"use client";

import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { ipcEvents } from "~/constants/ipc-events";
import { RawChatEvent } from "~/types/event";
import { useChatLog } from "../stores/chat-log";

export const useChatLogListener = () => {
  const log = useChatLog((s) => s.log);

  useEffect(() => {
    const unlistenPromise = listen(ipcEvents.log.chat, (e) => {
      const raw = e.payload as RawChatEvent;
      console.log(e.payload);
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, []);
};
