import { Links } from "./links";
import { LiveStatus } from "./live-status";

export const GlobalNavigationBar: React.FC = () => {
  return (
    <header className="flex justify-between  p-1">
      <Links />
      <LiveStatus />
    </header>
  );
};
