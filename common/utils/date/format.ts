export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("ko-KR");
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString("ko-KR");
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  let res = "";
  if (hours > 0) res += `${hours}시간`;
  if (minutes > 0) res += `${minutes}분`;
  return res;
};
