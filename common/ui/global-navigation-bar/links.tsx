"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  // {
  //   href: route.setting,
  //   label: "설정",
  // },
];

export const Links = () => {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 items-center justify-center flex-grow ">
      {links.map((l) => {
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-md text-gray-500 hover:text-gradient ${
              pathname === l.href ? "text-gradient-accent font-semibold" : ""
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
};
