import { ChatEvent } from "~/types";
import { DomainEventType } from "~/types/event/domain";
import { useOtherEventStore } from "~/common/stores/other-event-store";
import { isTargetUser } from "~/common/utils/target-users";

/**
 * Other Event 처리를 담당하는 클래스
 * 특정 조건에 맞는 chat event를 other-event-store로 전달
 */
export class OtherEventProcessor {
  /**
   * 이벤트가 other-event-store로 전달되어야 하는지 확인합니다
   */
  shouldProcess(event: ChatEvent): boolean {
    // 특정 userId나 manager 조건 확인
    const isManager = event.user?.status?.isManager;
    const isTarget = isTargetUser(event.user?.id || "");
    
    return isManager || isTarget;
  }

  /**
   * 이벤트를 other-event-store로 전달합니다
   */
  sendToOtherStore(event: ChatEvent): void {
    if (this.shouldProcess(event)) {
      useOtherEventStore.getState().addEvent({
        id: event.id,
        type: DomainEventType.Chat,
        payload: event,
      });
    }
  }
}
