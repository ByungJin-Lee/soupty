import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export enum PopoverId {
  ChatHeader = "chat-header",
  // 추후 다른 popover 추가 시 여기에 enum 값 추가
}

export interface PopoverPosition {
  x: number;
  y: number;
}

export interface PopoverState {
  id: PopoverId | null;
  payload: unknown;
  position: PopoverPosition | null;
  isVisible: boolean;
}

interface PopoverActions {
  showPopover(id: PopoverId, payload: unknown, position: PopoverPosition): void;
  hidePopover(): void;
  updatePosition(position: PopoverPosition): void;
}

export const usePopoverStore = create<PopoverState & PopoverActions>()(
  subscribeWithSelector((set) => ({
    id: null,
    payload: null,
    position: null,
    isVisible: false,

    showPopover(id, payload, position) {
      set({
        id,
        payload,
        position,
        isVisible: true,
      });
    },

    hidePopover() {
      set({
        id: null,
        payload: null,
        position: null,
        isVisible: false,
      });
    },

    updatePosition(position) {
      set({ position });
    },
  }))
);