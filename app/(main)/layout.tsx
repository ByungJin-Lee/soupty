import { GlobalEventProvider } from "~/common/components/global-event-provider";
import { GlobalNavigationBar } from "~/common/ui/global-navigation-bar";
import { WindowTitlebar } from "~/common/ui/window-titlebar/window-titlebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-full">
      <GlobalEventProvider />
      <WindowTitlebar>
        <GlobalNavigationBar />
      </WindowTitlebar>
      {children}
    </main>
  );
}
