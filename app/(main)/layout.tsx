import { Toaster } from "react-hot-toast";
import { AppTracker } from "~/common/components/app-tracker";
import { GlobalEventProvider } from "~/common/components/global-event-provider";
import { GlobalPopoverProvider } from "~/common/components/global-popover-provider";
import { VodSelectModal } from "~/common/ui";
import { ConfirmModal } from "~/common/ui/confirm-modal";
import { GlobalNavigationBar } from "~/common/ui/global-navigation-bar";
import { PromptModal } from "~/common/ui/prompt-modal";
import { WindowTitlebar } from "~/common/ui/window-titlebar/window-titlebar";
import { toastOptions } from "~/constants/toast";
import { ChannelEditModal } from "~/features/soop/components/channel/channel-edit-modal";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-full">
      <GlobalEventProvider />
      <AppTracker />
      <PromptModal />
      <ChannelEditModal />
      <ConfirmModal />
      <VodSelectModal />
      <Toaster toastOptions={toastOptions} />
      <GlobalPopoverProvider />
      <WindowTitlebar>
        <GlobalNavigationBar />
      </WindowTitlebar>
      {children}
    </main>
  );
}
