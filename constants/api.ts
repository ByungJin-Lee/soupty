// API related constants
export const API_ENDPOINTS = {
  STREAMER_PROFILE_BASE: "https://profile.img.sooplive.co.kr/LOGO",
  USER_PAGE: (userId: string) => `https://ch.sooplive.co.kr/${userId}`,
} as const;
