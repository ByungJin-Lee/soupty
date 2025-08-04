import { openWebviewWindow } from "~/common/utils/window";
import { route } from "~/constants";
import { HistoryOpenerOption } from "../types/opener";

export const openHistory = (option?: HistoryOpenerOption) => {
  return openWebviewWindow(
    `${route.history}-${Date.now()}`,
    "기록",
    buildHistoryUrl(option)
  );
};

const buildHistoryUrl = (option?: HistoryOpenerOption): string => {
  if (!option) return route.history;

  const queries: Record<string, string> = {};

  if (option.type) queries["type"] = option.type;
  if (option.userId) queries["userId"] = option.userId;
  if (option.sessionId) queries["sessionId"] = option.sessionId.toString();
  if (option.channelId) queries["channelId"] = option.channelId;

  const searchParams = new URLSearchParams(queries);

  return route.history + "?" + searchParams.toString();
};
