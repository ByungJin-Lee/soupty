import { LayoutHeader } from "~/features/live/components/layout-blueprinter/layout-header";

export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <LayoutHeader />
      {children}
    </>
  );
}
