"use client";

import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";

type IpcEventHandler<T> = (e: T) => void;

/**
 * @description Ipc Event를 이용하기 위한 hook
 */
export const useIpcEventListener = <T>(
  eventName: string,
  handler: IpcEventHandler<T>
) => {
  useEffect(() => {
    const unlistenPromise = listen(eventName, (e) => {
      handler(e.payload as T);
    });

    return () => {
      unlistenPromise.then((fn) => fn());
    };
  }, [eventName, handler]);
};
