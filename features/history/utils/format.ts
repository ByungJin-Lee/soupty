export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("ko-KR");
};
