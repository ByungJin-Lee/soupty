import { Fragment, useCallback } from "react";
import { PopoverId, usePopoverStore } from "~/common/ui/popover";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent } from "~/types/event";
import { ChatBadge } from "./chat-badge";

type Props = {
  data: ChatEvent;
};

export const ChatRow: React.FC<Props> = ({ data }) => {
  return (
    <div className="flex gap-x-1 mt-3">
      <Header data={data} />
      <ChatMessage parts={data.parts} />
    </div>
  );
};

type HeaderProps = {
  data: ChatEvent;
};

const Header: React.FC<HeaderProps> = ({ data }) => {
  const { togglePopover } = usePopoverStore();

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      togglePopover(PopoverId.ChatHeader, data.user.id, event, data);
    },
    [data, togglePopover]
  );

  return (
    <div
      className="min-w-[120px] max-w-[120px] flex cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
      onClick={handleClick}
    >
      {data.badges.map((b) => (
        <ChatBadge key={b} badge={b} />
      ))}
      <span
        className="break-all font-medium ml-1"
        style={{ color: data.color }}
      >
        {data.user.label}
      </span>
    </div>
  );
};

type MessageProps = {
  parts: MessagePart[];
};

const ChatMessage: React.FC<MessageProps> = ({ parts }) => {
  return (
    <div className="break-all">
      {parts.map((p, i) => {
        let content: React.ReactNode = null;

        switch (p.type) {
          case MessageType.Text:
            content = p.value;
            break;
          case MessageType.Emoji:
            content = (
              <img
                className="inline-block mr-1"
                title={p.value.title}
                src={p.value.imageUrl}
                referrerPolicy="no-referrer"
              />
            );
            break;
          case MessageType.OGQ:
            content = (
              <img
                className="inline-block mr-1"
                title="OGQ"
                src={p.value}
                referrerPolicy="no-referrer"
              />
            );
            break;
        }

        return <Fragment key={i}>{content}</Fragment>;
      })}
    </div>
  );
};
