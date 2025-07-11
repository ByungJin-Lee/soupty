import { PropsWithChildren } from "react";
import { WindowTitlebarControls } from "./window-titlebar-controls";

export const WindowTitlebar: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex items-center  border-b border-gray-200">
      <div className="flex-grow">{children}</div>
      {/* controls */}
      <WindowTitlebarControls />
    </div>
  );
};
