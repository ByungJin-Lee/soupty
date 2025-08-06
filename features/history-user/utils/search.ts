import { getOneDayPeriod } from "~/common/utils/date/calc";
import ipcService from "~/services/ipc";
import { sortEntry } from "./entry";

export const searchUserLogs = async (
  userId: string,
  channelId: string,
  date: string
) => {
  const { start, end } = getOneDayPeriod(date);

  const result = await ipcService.chatHistory.searchUserLogs(
    {
      userId,
      channelId,
      startDate: start,
      endDate: end,
    },
    { page: 1, pageSize: 100000 }
  );

  return {
    date,
    logs: sortEntry(result.logs),
  };
};
