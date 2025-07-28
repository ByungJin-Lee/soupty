import { invoke, InvokeArgs } from "@tauri-apps/api/core";
import {
  IpcPayloadMap,
  IpcRequestWithoutPayload,
  IpcRequestWithPayload,
  IpcResponseMap,
} from "./types";

/**
 * @description Payload에 따라 Overload된 함수를 정의합니다
 */
interface IpcClient {
  <K extends IpcRequestWithoutPayload>(name: K): Promise<IpcResponseMap[K]>;
  <K extends IpcRequestWithPayload>(
    name: K,
    payload: IpcPayloadMap[K]
  ): Promise<IpcResponseMap[K]>;
}

/**
 * @description ipc 요청을 관리하는 객체입니다.
 */
export const ipcClient: IpcClient = async (name: string, payload?: unknown) => {
  console.log(`IPC Client: Calling ${name} with payload:`, payload);
  
  const resp = await invoke(name, payload as InvokeArgs);
  
  console.log(`IPC Client: Response from ${name}:`, resp);
  return resp;
};
