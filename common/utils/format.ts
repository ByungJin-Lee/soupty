import { Channel } from "~/types";

/**
 * @description 채널의 이미지를 가져옵니다.
 */
export const formatChannelImage = (channel: Channel) => {
  return `https://profile.img.sooplive.co.kr/LOGO/${channel.id.slice(0, 2)}/${
    channel.id
  }/${channel.id}.jpg`;
};
