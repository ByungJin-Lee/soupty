import { listen } from "@tauri-apps/api/event";
import { ipcListener } from "~/common/utils/ipc";
import { ipcEvents } from "~/constants/ipc-events";
import { DomainEvent, RawChatEvent } from "~/types/event";
import { Stats } from "~/types/stats";

type Callbacks = {
  chat: (e: RawChatEvent) => void;
  other: (e: DomainEvent) => void;
  stats: (e: Stats) => void;
  disconnect?: () => void;
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
      ipcListener.listenChat((e) => this.callbacks?.chat(e));
      ipcListener.listenEvent((e) => this.callbacks?.other(e));

      listen<Stats>(ipcEvents.log.stats, (e) => {
        this.callbacks?.stats(e.payload);
      });
      listen(ipcEvents.event.disconnect, () => {
        this.callbacks?.disconnect?.();
      });
      // remove listener 등록
      this.isListening = true;
    } catch (e) {
      throw e;
    }
  }
}
