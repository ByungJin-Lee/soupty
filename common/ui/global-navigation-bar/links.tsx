"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { route } from "~/constants/route";
import { openHistory } from "~/features/history/utils/opener";

const links: { href: string; label: string; handler?: () => void }[] = [
  {
    href: route.live,
    label: "라이브",
  },
  {
    href: route.broadcast,
    label: "방송",
  },
  {
    href: route.history,
    label: "기록",
    handler() {
      openHistory();
    },
  },
  {
    href: route.setting,
    label: "설정",
  },
];

export const Links = () => {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 items-center mx-auto">
      {links.map((l) => {
        return (
          <Fragment key={l.href}>
            {l.handler ? (
              <button
                onClick={l.handler}
                className={`text-sm text-gray-500 rounded-md py-0.5 px-2`}
              >
                {l.label}
              </button>
            ) : (
              <Link
                href={l.href}
                className={`text-sm text-gray-500 rounded-md py-0.5 px-2 ${
                  pathname === l.href ? "text-white bg-gradient-accent" : ""
                }`}
              >
                {l.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};
