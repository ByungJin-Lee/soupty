import { GlobalEventProvider } from "~/common/components/global-event-provider";
import { GlobalNavigationBar } from "~/common/ui/global-navigation-bar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <GlobalEventProvider />
      <GlobalNavigationBar />
      <main className="flex-grow overflow-hidden">{children}</main>
    </main>
  );
}
