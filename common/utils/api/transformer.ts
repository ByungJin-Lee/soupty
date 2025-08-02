import { API_ENDPOINTS } from "~/constants";

export const transformChannelImage = (streamerId: string) => {
  return `${API_ENDPOINTS.STREAMER_PROFILE_BASE}/${streamerId.slice(
    0,
    2
  )}/${streamerId}/${streamerId}.jpg`;
};

export const transformPaginationParams = (page: number, pageSize: number) => {
  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, Math.min(100, pageSize)),
  };
};

export const transformVODURL = (id: number, changeSeconds?: number) =>
  `https://vod.sooplive.co.kr/player/${id}${
    changeSeconds ? `?change_second=${changeSeconds}` : ""
  }`;
