import { listen } from "@tauri-apps/api/event";
import { ipcEvents } from "~/constants/ipc-events";
import { RawChatEvent } from "~/types/event";

type Callbacks = {
  chat: (e: RawChatEvent) => void;
  other: (e: unknown) => void;
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
      listen(ipcEvents.log.event, (e) => {
        this.callbacks?.other(e);
      });
      // remove listener 등록
      this.isListening = true;
    } catch (e) {
      throw e;
    }
  }
}
