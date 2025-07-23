import { formatDuration } from "~/common/utils/format";
import { ReportData } from "~/services/ipc/types";

type Props = {
  data: ReportData;
};

export const ReportSummary: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <dt className="text-sm font-medium text-gray-500">총 채팅 수</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">
          {data.chatAnalysis.totalCount.toLocaleString()}
        </dd>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <dt className="text-sm font-medium text-gray-500">총 이벤트 수</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">0</dd>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <dt className="text-sm font-medium text-gray-500">활성 시청자</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">
          {data.userAnalysis.unique.total.toLocaleString()}명
        </dd>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <dt className="text-sm font-medium text-gray-500">방송 시간</dt>
        <dd className="mt-1 text-2xl font-semibold text-gray-900">
          {formatDuration(data.metadata.durationSeconds)}
        </dd>
      </div>
    </div>
  );
};
