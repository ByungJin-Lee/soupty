"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize, Minus, RefreshCw, X } from "react-feather";
import { useChannel } from "~/features/soop";
import { ConnectStatus } from "~/features/soop/stores/channel";

export const WindowTitlebarControls = () => {
  const connectStatus = useChannel((state) => state.connectStatus);
  const disconnect = useChannel((state) => state.disconnect);

  const close = async () => {
    try {
      if (connectStatus === ConnectStatus.CONNECTED) {
        await disconnect();
      }
    } finally {
      getCurrentWindow().close();
    }
  };
  const minimize = () => getCurrentWindow().minimize();
  const maximize = () => getCurrentWindow().toggleMaximize();
  const reload = () => window.location.reload();

  return (
    <div className="flex *:w-11 *:hover:text-white h-full">
      <button className="hover:bg-purple-500" onClick={reload}>
        <RefreshCw className="mx-auto" strokeWidth={1} size={16} />
      </button>
      <button className="hover:bg-amber-300" onClick={minimize}>
        <Minus className="mx-auto" strokeWidth={1} size={16} />
      </button>
      <button className="hover:bg-green-400" onClick={maximize}>
        <Maximize strokeWidth={1} className="mx-auto" size={16} />
      </button>
      <button className="hover:bg-rose-500" onClick={close}>
        <X strokeWidth={1} className="mx-auto" size={16} />
      </button>
    </div>
  );
};
