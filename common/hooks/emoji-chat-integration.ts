import { useEffect } from "react";
import { useChatEventStore } from "~/common/stores/chat-event-store";
import { mergeWithDefault } from "~/features/emoji";
import { createEmojiProcessor } from "~/features/emoji/processors/emoji-processor";
import { transformStreamerEmojis } from "~/features/emoji/utils";
import { makeEmojiRegex } from "~/features/emoji/utils/converter";
import { useChannel } from "~/features/soop/stores/channel";
import ipcService from "~/services/ipc";

/**
 * 채널 변경 시 이모지 프로세서를 업데이트하는 hook
 */
export function useEmojiChatIntegration() {
  const { updateChatProcessor } = useChatEventStore();
  const { channel } = useChannel();

  // 채널 변경 시 이모지 프로세서 업데이트
  useEffect(() => {
    if (!channel) return;

    const updateProcessor = async () => {
      try {
        const emojis = await ipcService.soop.getStreamerEmoji(channel.id);
        const emojiStatic = mergeWithDefault(
          transformStreamerEmojis(channel.id, emojis)
        );

        if (Object.keys(emojiStatic).length > 0) {
          const regex = makeEmojiRegex(emojiStatic);
          updateChatProcessor({
            regex,
            process: createEmojiProcessor(emojiStatic).process,
          });
        }
      } catch (error) {
        console.error("Failed to update emoji processor:", error);
      }
    };

    updateProcessor();
  }, [channel, updateChatProcessor]);
}
