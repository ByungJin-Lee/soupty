export const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}초`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간`;
  return `${Math.floor(seconds / 86400)}일`;
};

export const getSeverityColor = (seconds: number) => {
  if (seconds <= 60) return "bg-orange-700/80"; // 1분 이하
  if (seconds <= 300) return "bg-red-700/80"; // 5분 이하
  if (seconds <= 3600) return "bg-red-800/85"; // 1시간 이하
  return "bg-red-900/90"; // 1시간 초과
};