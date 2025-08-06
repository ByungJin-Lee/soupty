export const route = Object.freeze({
  home: "/",
  live: "/live",
  clip: "/clip",
  broadcast: "/broadcast",
  broadcastSession(id: number | string) {
    return `/session?id=${id}`;
  },
  history: "/history",
  historyUser(userId: string, channelId: string) {
    return `/history/user?userId=${userId}&channelId=${channelId}`;
  },
  setting: "/setting",
});
