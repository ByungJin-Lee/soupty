import { Toaster } from "react-hot-toast";
import { GlobalPopoverProvider } from "~/common/components/global-popover-provider";
import { VodSelectModal } from "~/common/ui";
import { ConfirmModal } from "~/common/ui/confirm-modal";
import { PromptModal } from "~/common/ui/prompt-modal";
import { toastOptions } from "~/constants/toast";
import { LiveUserHistoryModal } from "~/features/live/components/live-user-history";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-full">
      <PromptModal />
      <ConfirmModal />
      <LiveUserHistoryModal />
      <VodSelectModal />
      <Toaster toastOptions={toastOptions} />
      <GlobalPopoverProvider />
      {children}
    </main>
  );
}
