import { useEffect, useState } from "react";
import useSWR from "swr";
import {
  createEmojiProcessor,
  makeEmojiRegex,
  mergeWithDefault,
} from "~/features/emoji";
import { transformStreamerEmojis } from "~/features/emoji/utils";
import ipcService from "~/services/ipc";
import { ChatProcessor } from "../processors/chat-processor";

export const useChatProcessor = (channelId: string) => {
  const { data } = useSWR(
    `/emoji-${channelId}`,
    () => ipcService.soop.getStreamerEmoji(channelId),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      refreshInterval: 100000000,
    }
  );

  const [chatProcessor, setChatProcessor] = useState<ChatProcessor | null>(
    null
  );

  useEffect(() => {
    if (!data) return;

    const emojiStatic = mergeWithDefault(
      transformStreamerEmojis(channelId, data)
    );

    if (Object.keys(emojiStatic).length > 0) {
      const regex = makeEmojiRegex(emojiStatic);
      setChatProcessor(
        new ChatProcessor({
          regex,
          process: createEmojiProcessor(emojiStatic).process,
        })
      );
    }
  }, [data, setChatProcessor]);

  return chatProcessor;
};
