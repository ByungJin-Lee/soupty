import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export enum PopoverId {
  UserInfo = "user-info",
  MuteLog = "mute-log",
  // 추후 다른 popover 추가 시 여기에 enum 값 추가
}

export interface PopoverPosition {
  x: number;
  y: number;
}

export interface PopoverState {
  id: PopoverId | null;
  key: string | null;
  rect: DOMRect | null;
  payload: unknown;

  isVisible: boolean;
}

interface PopoverActions {
  togglePopover(
    id: PopoverId,
    key: string,
    event: React.MouseEvent,
    payload: unknown
  ): void;
  hidePopover(): void;
  updateRect(rect: DOMRect): void;
}

export const usePopoverStore = create<PopoverState & PopoverActions>()(
  subscribeWithSelector((set, get) => ({
    id: null,
    key: null,
    payload: null,
    rect: null,
    isVisible: false,

    togglePopover(id, key, event, payload) {
      event.stopPropagation(); // 이벤트 버블링 방지

      const state = get();
      const rect = event.currentTarget.getBoundingClientRect();

      // 같은 key의 팝오버가 이미 열려있으면 닫기
      if (state.isVisible && state.key === key) {
        set({
          id: null,
          key: null,
          payload: null,
          rect: null,
          isVisible: false,
        });
      } else {
        // 새로운 팝오버 열기
        set({
          id,
          key,
          payload,
          rect,
          isVisible: true,
        });
      }
    },

    hidePopover() {
      set({
        id: null,
        key: null,
        payload: null,
        rect: null,
        isVisible: false,
      });
    },

    updateRect(rect) {
      set({ rect });
    },
  }))
);
