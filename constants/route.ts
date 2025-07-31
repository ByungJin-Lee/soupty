export const route = Object.freeze({
  home: "/",
  live: "/live",
  clip: "/clip",
  broadcast: "/broadcast",
  broadcastSession(id: number | string) {
    return `${this.broadcast}/session?id=${id}`;
  },
  history: "/history",
  setting: "/setting",
});
