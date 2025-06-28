import { Emoji, EmojiStatic } from "~/types";
import { emojis } from "./constants";

export const transformStreamerEmojis = (
  streamerId: string,
  emojis: Emoji[]
): EmojiStatic => {
  return Object.fromEntries(
    emojis.map((v) => [
      v.title,
      `https://static.file.sooplive.co.kr/signature_emoticon/${streamerId}/${v.pc_img}`,
    ])
  );
};

export const mergeWithDefault = (emojiStatic: EmojiStatic): EmojiStatic => ({
  ...emojis,
  ...emojiStatic,
});

export const makeEmojiRegex = (emojiStatic: EmojiStatic) => {
  return new RegExp(`/(${Object.keys(emojiStatic).join("|")})/`);
};
