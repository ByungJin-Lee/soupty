/**
 * @description 채널의 이미지를 가져옵니다.
 */
export const formatChannelImage = (streamerId: string) => {
  return `https://profile.img.sooplive.co.kr/LOGO/${streamerId.slice(
    0,
    2
  )}/${streamerId}/${streamerId}.jpg`;
};

export const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("ko-KR");
};

export const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);

  let res = "";
  if (hours > 0) res += `${hours}시간`;
  if (minutes > 0) res += `${minutes}분`;
  return res;
};
