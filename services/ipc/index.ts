import { channel } from "./channel";
import { soop } from "./soop";

/**
 * @description Ipc Service 전체를 관리하는 객체입니다.
 */
export const ipcService = Object.freeze({
  soop,
  channel,
});

export default ipcService;
