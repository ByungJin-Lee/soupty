"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { PropsWithChildren } from "react";
import { Minus, X } from "react-feather";

export const WindowTitlebar: React.FC<PropsWithChildren> = ({ children }) => {
  const close = () => getCurrentWindow().close();
  const minimize = () => getCurrentWindow().minimize();

  return (
    <div className="flex items-center  border-b border-gray-100">
      <div data-tauri-drag-region className="flex-grow">
        {children}
      </div>
      {/* controls */}
      <div className="flex *:w-11 *:hover:text-white h-full">
        <button className="hover:bg-amber-300" onClick={minimize}>
          <Minus className="mx-auto" strokeWidth={1} size={16} />
        </button>
        <button className="hover:bg-rose-500" onClick={close}>
          <X strokeWidth={1} className="mx-auto" size={16} />
        </button>
      </div>
    </div>
  );
};
