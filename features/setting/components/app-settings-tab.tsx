import { openUrl } from "@tauri-apps/plugin-opener";
import toast from "react-hot-toast";
import { useAppVersion } from "~/common/hooks";
import { Button } from "~/common/ui";
import { SURVEY_URL } from "~/constants";
import ipcService from "~/services/ipc";

export const AppSettingsTab = () => {
  const version = useAppVersion();

  const handleReport = () => {
    if (version) {
      openUrl(SURVEY_URL(version));
    }
  };

  const handleOpenDataDir = async () => {
    try {
      await ipcService.app.openAppDataDir();
    } catch (error) {
      console.error("데이터 디렉토리 열기 실패:", error);
      toast.error("디렉토리 열기 실패");
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium mb-1">데이터 폴더</h3>
        <p className="text-sm text-gray-600 mb-1">
          앱 데이터가 저장된 폴더를 엽니다. DB 파일 import/export 시 사용하세요.
          <br />
          (앱 종료 후 작업해주세요.)
          <br />
          <span className="underline">
            폴더 내 파일을 삭제하면, 앱이 초기화 됩니다.
          </span>
        </p>
        <Button onClick={handleOpenDataDir} variant="secondary">
          데이터 폴더 열기
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-1">제보</h3>
        <p className="text-sm text-gray-600 mb-1">
          버그나 개선사항을 제보해주세요.
        </p>
        <Button onClick={handleReport} variant="primary">
          제보하기
        </Button>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-1">앱 버전</h3>
        <p className="text-sm text-gray-600 mb-1">{version}</p>
      </div>
    </div>
  );
};
