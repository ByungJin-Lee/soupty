import { splitTextMessageParts } from "~/features/chat/utils";
import { getNicknameColor } from "~/features/chat/utils/nickname-color";
import { Badge } from "~/types/badge";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent, RawChatEvent } from "~/types/event";

/**
 * Chat 이벤트 처리를 담당하는 클래스
 */
export class ChatProcessor {
  constructor(
    private emojiProcessor?: {
      regex: RegExp;
      process: (text: string, regex: RegExp) => MessagePart[];
    }
  ) {}

  /**
   * emoji 처리기를 업데이트합니다
   */
  updateEmojiProcessor(processor: {
    regex: RegExp;
    process: (text: string, regex: RegExp) => MessagePart[];
  }) {
    this.emojiProcessor = processor;
  }

  makeParts(raw: RawChatEvent): MessagePart[] {
    let parts: MessagePart[] = [];

    if (raw.ogq) {
      const p = raw.ogq;
      parts = [
        {
          type: MessageType.OGQ,
          value: `https://ogq-sticker-global-cdn-z01.sooplive.co.kr/sticker/${p.id}/${p.number}_80.${p.ext}?ver=${p.version}`,
        },
      ];
    } else {
      const message = raw.comment;
      // emoji 처리기가 있고 emoji가 매치되는 경우
      if (this.emojiProcessor && message.match(this.emojiProcessor.regex)) {
        parts = this.emojiProcessor.process(message, this.emojiProcessor.regex);
      } else {
        // 일반 텍스트 처리
        parts = splitTextMessageParts(message);
      }
    }
    return parts;
  }

  makeBadges(raw: RawChatEvent): Badge[] {
    const badges: Badge[] = [];

    const u = raw.user;

    // super user
    if (u.status.isBj || u.status.isManager) {
      badges.push(u.status.isBj ? Badge.BJ : Badge.Manager);
      return badges;
    }

    // 열혈 / 일반 팬 / 서포터
    if (u.status.isTopFan) {
      badges.push(Badge.TopFan);
    } else if (u.status.isFan) {
      badges.push(Badge.Fan);
    } else if (u.status.isSupporter) {
      badges.push(Badge.Supporter);
    }

    // 구독자(팔로우)
    if (u.status.follow) {
      badges.push(u.status.follow === 2 ? Badge.FollowBasic : Badge.FollowPlus);
    }

    return badges;
  }

  /**
   * Raw chat 이벤트를 처리된 chat 이벤트로 변환합니다
   */
  processEvent(rawEvent: RawChatEvent): ChatEvent {
    const event = rawEvent as ChatEvent;
    // parts를 만듭니다.
    event.parts = this.makeParts(rawEvent);
    // badge를 만듭니다.
    event.badges = this.makeBadges(rawEvent);
    // 닉네임 색상을 설정합니다.
    event.color = getNicknameColor(rawEvent.user.label);

    return event;
  }
}
