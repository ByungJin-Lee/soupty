import { ReportData } from "~/services/ipc/types";
import { ChatTrendChart } from "./chat-trend-chart";
import { LOLTrendChart } from "./lol-trend-chat";
import { PopularWordsTable } from "./popular-words-table";
import { TopChattersTable } from "./top-chatters-table";

type Props = {
  data: ReportData;
};

export const ChatReport: React.FC<Props> = ({ data }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800 flex items-center bg-blue-200 py-1 rounded-md">
        <span className="px-3 rounded-lg text-base mr-3">💬</span>
        채팅 지표
      </h3>

      <ChatTrendChart data={data} />
      <LOLTrendChart data={data} />
      <TopChattersTable topChatters={data.chatAnalysis.topChatters} />
      <PopularWordsTable popularWords={data.chatAnalysis.popularWords} />
    </div>
  );
};
