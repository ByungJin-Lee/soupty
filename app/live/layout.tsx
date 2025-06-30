export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex max-h-full">{children}</div>;
}
