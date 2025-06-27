"use client";

import { useCallback, useMemo } from "react";
import { useIpcEventListener } from "~/common/hooks/ipc-event-listener";
import { ipcEvents } from "~/constants/ipc-events";
import { useEmoji } from "~/features/emoji/stores/emoji";
import { EmojiStatic } from "~/types";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent, RawChatEvent } from "~/types/event";
import { useChatLog } from "../stores/chat-log";

type ConvertOption = {
  emoji: {
    regex: RegExp;
    static: EmojiStatic;
  };
};

export const useChatLogListener = () => {
  const emoji = useEmoji();
  const log = useChatLog((s) => s.log);

  // convert에 사용될 options 생성
  const options = useMemo(
    () => ({
      emoji: {
        regex: emoji.regex,
        static: emoji.emojiStatic,
      },
    }),
    [emoji.emojiStatic, emoji.regex]
  );

  const handler = useCallback(
    (e: RawChatEvent) => log(convert(e, options)),
    [options, log]
  );

  useIpcEventListener(ipcEvents.log.chat, handler);
};

const convert = (raw: RawChatEvent, options: ConvertOption): ChatEvent => {
  // react에서 관리되는 obj가 아니므로 객체를 수정합니다.
  const res = raw as ChatEvent;
  // 이모지를 가지고 있는지 판단
  const emojiMatch = raw.comment.match(options.emoji.regex);

  const message = res.comment;

  // render에 사용되는 parts를 구성합니다.
  let parts: MessagePart[] = [];

  if (res.ogq) {
    parts = [
      {
        type: MessageType.OGQ,
        value: res.ogq,
      },
    ];
  } else {
    parts = emojiMatch
      ? message.split(options.emoji.regex).flatMap((part, i): MessagePart[] =>
          i % 2 == 0
            ? splitTextMessageParts(part)
            : [
                {
                  type: MessageType.Emoji,
                  value: { title: part, imageUrl: options.emoji.static[part] },
                },
              ]
        )
      : splitTextMessageParts(message);
    res.parts = parts;
    return res;
  }
};

const splitTextMessageParts = (message: string): MessagePart[] => {
  return message
    .split(/([^ ]+)/)
    .filter((part) => part !== "")
    .map((part) => ({ type: MessageType.Text, value: part }));
};
