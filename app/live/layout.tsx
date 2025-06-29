export default function LiveLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="max-h-full grid grid-cols-3">{children}</div>;
}
