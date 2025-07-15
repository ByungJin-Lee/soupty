import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useChannel } from "~/features/soop/stores/channel";
import GlobalEventManger from "~/services/manager/event-manager";
import { DomainEventType, MetadataUpdateEvent, RawDomainEvent } from "~/types";
import { useChatEventStore } from "./chat-event-store";
import { useOtherEventStore } from "./other-event-store";
import { useStatsEventStore } from "./stats-event-store";

interface EventManagerState {
  isListening: boolean;
}

interface EventManagerActions {
  startListening(): void | (() => Promise<void>);
  stopListening(): void;
}

export const useEventManagerStore = create<
  EventManagerState & EventManagerActions
>()(
  subscribeWithSelector((set) => {
    return {
      isListening: GlobalEventManger.getInstance().isListening,

      startListening() {
        try {
          const eventManager = GlobalEventManger.getInstance();

          // 각 store의 핸들러를 가져와서 등록
          const chatHandler = useChatEventStore.getState().handleChatEvent;
          const otherHandler = useOtherEventStore.getState().handleOtherEvent;
          const statsHandler = useStatsEventStore.getState().handleStatsEvent;
          const channelHandler = useChannel.getState().handleMetadataUpdate;

          const customOtherHandler = (e: RawDomainEvent) => {
            if (e.type === DomainEventType.MetadataUpdate) {
              channelHandler(e.payload as MetadataUpdateEvent);
            } else {
              otherHandler(e);
            }
          };

          eventManager.setCallbacks({
            chat: chatHandler,
            other: customOtherHandler,
            stats: statsHandler,
          });

          eventManager.start();
          set({ isListening: true });
          return;
        } catch (error) {
          console.error("Failed to start event listening:", error);
        }
      },

      stopListening() {
        set({ isListening: false });
      },
    };
  })
);
