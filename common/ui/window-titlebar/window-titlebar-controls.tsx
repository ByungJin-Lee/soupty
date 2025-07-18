"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { Maximize, Minus, X } from "react-feather";

export const WindowTitlebarControls = () => {
  const close = () => getCurrentWindow().close();
  const minimize = () => getCurrentWindow().minimize();
  const maximize = () => getCurrentWindow().toggleMaximize();

  return (
    <div className="flex *:w-11 *:hover:text-white h-full">
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
