"use client";

import { listen } from "@tauri-apps/api/event";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const router = useRouter();

  useEffect(() => {
    const initializeApp = async () => {
      // splash 초기화 완료 이벤트 수신
      const unsubscribe = await listen(
        "splash-initialization-complete",
        async () => {
          console.log("✅ Splash 초기화 완료 이벤트 수신");
          // /live로 라우팅
          router.replace("/live");
        }
      );

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        unsubscribe();
      };
    };

    initializeApp();
  }, [router]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="text-gradient-accent font-semibold text-4xl p-1">
        Soupty
      </span>
    </div>
  );
}
