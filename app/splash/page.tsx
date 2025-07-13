"use client";

import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect, useState } from "react";
import { setTargetUsers } from "~/common/utils/target-users";
import { ipcService } from "~/services/ipc";

export default function SplashPage() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("앱을 시작하는 중...");
  const [isLoading, setIsLoading] = useState(true);

  const updateProgress = (value: number, message: string) => {
    setProgress(value);
    setStatus(message);

    if (value >= 100) {
      setIsLoading(false);
    }
  };

  const initializeApp = useCallback(async () => {
    try {
      // 1. 업데이트 확인
      updateProgress(10, "[1/5] 업데이트 확인 중");
      await invoke("check_for_updates");

      // 2. 앱 상태 확인
      updateProgress(20, "[2/5] 앱 상태 확인 중");

      // 2-1. DB 연결
      updateProgress(30, "[3/5] DB 연결 중");
      await invoke("connect_database");

      // 2-2. AI 설정
      updateProgress(50, "[4/5] AI 설정 중");
      await invoke("setup_ai");

      // 2-3. App State 설정
      updateProgress(70, "[5/6] 최종 상태 설정 중");
      await invoke("setup_app_state");

      // 2-4. Target Users 초기화
      updateProgress(80, "[6/6] 사용자 설정 로드 중");
      const targetUsers = await ipcService.targetUsers.getTargetUsers();
      setTargetUsers(targetUsers);

      // 3. 완료
      updateProgress(90, "초기화 완료");

      // 메인 윈도우 표시
      updateProgress(100, "앱 시작 완료!");

      setTimeout(async () => {
        await showMainWindow();
      }, 500);
    } catch (error) {
      console.error("초기화 실패:", error);
      setStatus("초기화 실패. 다시 시도하세요.");
      setIsLoading(false);
    }
  }, []);

  const showMainWindow = async () => {
    try {
      await invoke("show_main_window");
      const currentWindow = getCurrentWindow();
      await currentWindow.close();
    } catch (error) {
      console.error("메인 윈도우 표시 실패:", error);
    }
  };

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  return (
    <div
      id="splash"
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-accent text-white font-sans overflow-hidden"
    >
      <div className="text-3xl font-bold mb-8 text-center">soupty</div>

      <div className="flex gap-2 text-sm mb-5 text-center opacity-90">
        <span>{status}</span>
        {isLoading && (
          <div className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mb-5" />
        )}
      </div>

      <div className="w-48 h-1 bg-white/30 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-white rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-5 text-xs opacity-70">v0.1.0</div>
    </div>
  );
}
