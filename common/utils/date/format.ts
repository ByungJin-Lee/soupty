export const formatTimestamp = (timestamp: Date | string | number) => {
  return (
    timestamp instanceof Date ? timestamp : new Date(timestamp)
  ).toLocaleString("ko-KR");
};

export const formatDayTimestamp = (timestamp: string | number) => {
  return new Date(timestamp).toLocaleString("ko-KR").slice(12);
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

export const formatTimeHHMMSS = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
