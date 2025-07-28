import { Toaster } from "react-hot-toast";
import { GlobalEventProvider } from "~/common/components/global-event-provider";
import { GlobalPopoverProvider } from "~/common/components/global-popover-provider";
import { ConfirmModal } from "~/common/ui/confirm-modal";
import { GlobalNavigationBar } from "~/common/ui/global-navigation-bar";
import { PromptModal } from "~/common/ui/prompt-modal";
import { WindowTitlebar } from "~/common/ui/window-titlebar/window-titlebar";
import { toastOptions } from "~/constants/toast";
import { LiveUserHistoryModal } from "~/features/live/components/live-user-history";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-full">
      <GlobalEventProvider />
      <PromptModal />
      <ConfirmModal />
      <LiveUserHistoryModal />
      <Toaster toastOptions={toastOptions} />
      <GlobalPopoverProvider />
      <WindowTitlebar>
        <GlobalNavigationBar />
      </WindowTitlebar>
      {children}
    </main>
  );
}
