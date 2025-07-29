export const AppSettingsTab = () => {
  const handleReset = () => {
    // TODO: IPC 통신으로 앱 전체 초기화
    console.log("앱 전체 초기화");
  };

  const handleReport = () => {
    // TODO: Google Form으로 연결
    console.log("제보하기");
  };

  return (
    <div className="space-y-6 px-4">
      <div>
        <h3 className="text-lg font-medium mb-3">앱 전체 초기화</h3>
        <p className="text-sm text-gray-600 mb-3">
          앱의 모든 데이터와 설정을 초기화합니다.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          초기화
        </button>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">제보</h3>
        <p className="text-sm text-gray-600 mb-3">
          버그나 개선사항을 제보해주세요.
        </p>
        <button
          onClick={handleReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          제보하기
        </button>
      </div>
    </div>
  );
};
