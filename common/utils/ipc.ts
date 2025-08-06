import { listen } from "@tauri-apps/api/event";
import { ipcEvents } from "~/constants";
import { DomainEvent, RawChatEvent, RawDomainEvent } from "~/types";

const listenEvent = (handler: (e: DomainEvent) => void) =>
  listen<RawDomainEvent>(ipcEvents.log.event, ({ payload: e }) => {
    try {
      if (!("payload" in e)) return;

      const processed: DomainEvent = {
        id: e.payload.id,
        type: e.type,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: e.payload as any,
      };
      handler(processed);
    } catch {}
  });

const listenChat = (handler: (e: RawChatEvent) => void) =>
  listen<RawChatEvent>(ipcEvents.log.chat, ({ payload: e }) => {
    handler(e);
  });

export const ipcListener = {
  listenEvent,
  listenChat,
};
