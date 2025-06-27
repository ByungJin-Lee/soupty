import { create } from "zustand";
import { EmojiStatic } from "~/types";
import { makeEmojiRegex } from "../converter";

interface EmojiState {
  regex: RegExp;
  emojiStatic: EmojiStatic;
  update(emojiStatic: EmojiStatic): void;
}

export const useEmoji = create<EmojiState>((set) => ({
  regex: new RegExp(""),
  emojiStatic: {},
  update(emojiStatic) {
    const regex = makeEmojiRegex(emojiStatic);
    set({
      regex,
      emojiStatic,
    });
  },
}));
