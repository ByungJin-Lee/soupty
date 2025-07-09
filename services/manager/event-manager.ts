import { listen } from "@tauri-apps/api/event";
import { ipcEvents } from "~/constants/ipc-events";
import { RawChatEvent, RawDomainEvent } from "~/types/event";
import { Stats } from "~/types/stats";

type Callbacks = {
  chat: (e: RawChatEvent) => void;
  other: (e: RawDomainEvent) => void;
  stats: (e: Stats) => void;
};

export default class GlobalEventManger {
  private static instance: GlobalEventManger;
  public isListening = false;
  private callbacks: Callbacks | null = null;

  private constructor() {}

  static getInstance() {
    if (!GlobalEventManger.instance) {
      GlobalEventManger.instance = new GlobalEventManger();
    }
    return GlobalEventManger.instance;
  }

  public setCallbacks(callbacks: Callbacks | null) {
    this.callbacks = callbacks;
  }

  public start() {
    if (this.isListening) {
      return;
    }
    try {
      listen<RawChatEvent>(ipcEvents.log.chat, (e) => {
        this.callbacks?.chat(e.payload);
      });
      listen<RawDomainEvent>(ipcEvents.log.event, (e) => {
        this.callbacks?.other(e.payload);
      });
      listen<Stats>(ipcEvents.log.stats, (e) => {
        this.callbacks?.stats(e.payload);
      });
      // remove listener 등록
      this.isListening = true;
    } catch (e) {
      throw e;
    }
  }
}
