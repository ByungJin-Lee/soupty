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
    href: route.broadcast,
    label: "방송",
  },
  {
    href: route.clip,
    label: "클립",
  },
  {
    href: route.history,
    label: "기록",
  },
  // {
  //   href: route.setting,
  //   label: "설정",
  // },
];

export const Links = () => {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 items-center mx-auto">
      {links.map((l) => {
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm text-gray-500 rounded-md py-0.5 px-2 ${
              pathname === l.href ? "text-white bg-gradient-accent" : ""
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
};
