import { GlobalEventProvider } from "~/common/components/global-event-provider";
import { GlobalNavigationBar } from "~/common/ui/global-navigation-bar";
import { WindowTitlebar } from "~/common/ui/window-titlebar/window-titlebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <GlobalEventProvider />
      <WindowTitlebar>
        <GlobalNavigationBar />
      </WindowTitlebar>

      <main className="flex-grow overflow-hidden">{children}</main>
    </main>
  );
}
