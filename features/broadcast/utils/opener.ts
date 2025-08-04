import { openWebviewWindow } from "~/common/utils/window";
import { route } from "~/constants";

export const openBroadcastSession = (id: number | string) => {
  return openWebviewWindow(
    `session-${id}`,
    "세션",
    route.broadcastSession(id),
    {
      width: 930,
    }
  );
};
