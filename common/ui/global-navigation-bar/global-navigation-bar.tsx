import { Links } from "./links";
import { LiveStatus } from "./live-status";

export const GlobalNavigationBar: React.FC = () => {
  return (
    <header
      data-tauri-drag-region
      className="flex justify-between items-center"
    >
      <span
        data-tauri-drag-region
        className="text-gradient-accent font-semibold ml-3 hidden sm:inline"
      >
        Soupty
      </span>
      <Links />
      <LiveStatus />
    </header>
  );
};
