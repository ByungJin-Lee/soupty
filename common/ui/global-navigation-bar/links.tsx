import Link from "next/link";
import { route } from "~/constants/route";

export const Links = () => {
  return (
    <div className="*:w-[100px] *:inline-block">
      <Link href={route.live}>라이브</Link>
      <Link href={route.clip}>클립</Link>
      <Link href={route.report}>리포트</Link>
      <Link href={route.setting}>설정</Link>
    </div>
  );
};
