import { createContext, useContext } from "react";
import { BroadcastSession } from "~/services/ipc/types";

type BroadcastSessionContext = BroadcastSession;

const ctx = createContext<BroadcastSessionContext | null>(null);

export const BroadcastSessionContextProvider = ctx.Provider;

export const useBroadcastSessionContext = () => {
  const context = useContext(ctx);
  if (!context) {
    throw Error("BroadcastSession context 내에서 호출해야합니다.");
  }
  return context;
};
