import { useEffect } from "react";
import { useChatEventStore } from "~/common/stores/chat-event-store";
import { createEmojiProcessor } from "~/features/emoji/processors/emoji-processor";
import { useEmoji } from "~/features/emoji/stores/emoji";

/**
 * Emoji store와 Chat processor 간의 통합을 관리하는 hook
 */
export function useEmojiChatIntegration() {
  const { regex, emojiStatic } = useEmoji();
  const { updateChatProcessor } = useChatEventStore();

  useEffect(() => {
    if (regex && Object.keys(emojiStatic).length > 0) {
      const emojiProcessor = createEmojiProcessor(emojiStatic);
      updateChatProcessor({
        regex,
        process: emojiProcessor.process,
      });
    }
  }, [regex, emojiStatic, updateChatProcessor]);
}
