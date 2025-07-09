import { Links } from "./links";
import { LiveStatus } from "./live-status";

export const GlobalNavigationBar: React.FC = () => {
  return (
    <header className="flex justify-between items-center">
      <span className="text-gradient-accent font-semibold ml-4">Soupty</span>
      <Links />
      <LiveStatus />
    </header>
  );
};
