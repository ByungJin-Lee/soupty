import { ChannelEditModal } from "~/features/soop/components/channel/channel-edit-modal";

export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ChannelEditModal />
    </>
  );
}
