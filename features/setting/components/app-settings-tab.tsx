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

      <div className="text-sm text-gray-500">
        본 프로그램은 SOOP Corp.에 의해 공식적으로 제공되거나 보증되는
        소프트웨어가 아닙니다. 본 프로그램은 SOOP 플랫폼에서 공개적으로 접근
        가능한 데이터를 사용자의 로컬 환경에서 처리하기 위한 개인적인 보조
        도구입니다.
        <br />
        <br />
        <b className="font-black">
          본 프로그램의 사용으로 인해 발생하는 모든 잠재적인 문제(계정 제재
          포함)에 대한 책임은 전적으로 사용자 본인에게 있습니다.
        </b>
        <br />
        <br />
        개발자는 본 소프트웨어의 사용으로 인한 직간접적인 손해에 대해 어떠한
        책임도 지지 않습니다. SOOP의 이용약관을 반드시 확인하시고, 약관에 위배될
        소지가 있다고 판단되시면 사용을 중단하시기 바랍니다.
      </div>
    </div>
  );
};
