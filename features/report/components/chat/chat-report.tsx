import { ReportData } from "~/services/ipc/types";
import { ChatTrendChart } from "./chat-trend-chart";
import { TopChattersTable } from "./top-chatters-table";
import { PopularWordsTable } from "./popular-words-table";

type Props = {
  data: ReportData;
};

export const ChatReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800 flex items-center">
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg text-base mr-3">
          💬
        </span>
        채팅 지표
      </h3>

      <ChatTrendChart data={data} />
      <TopChattersTable topChatters={data.chatAnalysis.topChatters} />
      <PopularWordsTable popularWords={data.chatAnalysis.popularWords} />
    </div>
  );
};
