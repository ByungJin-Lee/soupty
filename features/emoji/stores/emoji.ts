import { create } from "zustand";
import { EmojiStatic } from "~/types";
import { makeEmojiRegex } from "../converter";

interface EmojiState {
  regex: RegExp | null;
  emojiStatic: EmojiStatic | null;
  update(emojiStatic: EmojiStatic): void;
  match(message: string): RegExpMatchArray | null;
}

export const useEmoji = create<EmojiState>((set, get) => ({
  regex: null,
  emojiStatic: null,
  update(emojiStatic) {
    const regex = makeEmojiRegex(emojiStatic);
    set({
      regex,
      emojiStatic,
    });
  },
  match(message) {
    const regex = get().regex;
    if (regex) {
      return message.match(regex);
    }
    return null;
  },
}));
