export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-svh max-h-svh grid grid-cols-3">{children}</div>;
}
