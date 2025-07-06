import Link from "next/link";
import { route } from "~/constants/route";

const links: { href: string; label: string }[] = [
  {
    href: route.live,
    label: "라이브",
  },
  {
    href: route.clip,
    label: "클립",
  },
  {
    href: route.report,
    label: "리포트",
  },
  {
    href: route.setting,
    label: "설정",
  },
];

export const Links = () => {
  return (
    <div className="flex gap-2 items-center">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="text-lg font-semibold">
          {l.label}
        </Link>
      ))}
    </div>
  );
};
