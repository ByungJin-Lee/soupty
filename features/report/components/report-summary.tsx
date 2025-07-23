import { formatDuration } from "~/common/utils/format";
import { ReportData } from "~/services/ipc/types";

type Props = {
  data: ReportData;
};

export const ReportSummary: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-lg mr-3">
          📊
        </span>
        리포트 요약
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">💬</span>
            <dt className="text-sm font-semibold text-blue-700 uppercase tracking-wide">
              총 채팅 수
            </dt>
          </div>
          <dd className="text-3xl font-bold text-blue-900">
            {data.chatAnalysis.totalCount.toLocaleString()}
          </dd>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">💰</span>
            <dt className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
              총 후원 금액
            </dt>
          </div>
          <dd className="text-3xl font-bold text-purple-900">
            {data.eventAnalysis.totalDonationAmount.toLocaleString()}
            <span className="text-lg font-medium text-purple-700 ml-1">원</span>
          </dd>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">👥</span>
            <dt className="text-sm font-semibold text-green-700 uppercase tracking-wide">
              활성 시청자
            </dt>
          </div>
          <dd className="text-3xl font-bold text-green-900">
            {data.userAnalysis.unique.total.toLocaleString()}
            <span className="text-lg font-medium text-green-700 ml-1">명</span>
          </dd>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-xl shadow-sm">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⏰</span>
            <dt className="text-sm font-semibold text-orange-700 uppercase tracking-wide">
              방송 시간
            </dt>
          </div>
          <dd className="text-2xl font-bold text-orange-900">
            {formatDuration(data.metadata.durationSeconds)}
          </dd>
        </div>
      </div>
    </div>
  );
};
