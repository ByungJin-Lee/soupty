import { Fragment, memo } from "react";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent } from "~/types/event";
import { ChatBadge } from "./chat-badge";

type Props = {
  data: ChatEvent;
};

export const ChatRow: React.FC<Props> = memo(({ data }) => {
  return (
    <div className="flex gap-x-1 mt-3">
      <Header data={data} />
      <ChatMessage parts={data.parts} />
    </div>
  );
});

ChatRow.displayName = "ChatRow";

type HeaderProps = {
  data: ChatEvent;
};

const Header: React.FC<HeaderProps> = memo(({ data }) => {
  const handleClick = useUserPopoverDispatch(data.user);

  return (
    <div
      className="min-w-[120px] max-w-[120px] flex cursor-pointer hover:bg-gray-200 rounded px-1 py-0.5 transition-colors h-fit"
      onClick={handleClick}
    >
      {data.badges.map((b) => (
        <ChatBadge key={b} badge={b} />
      ))}
      <span
        className="break-all font-medium ml-1 inline-block h-fit"
        style={{ color: data.color }}
      >
        {data.user.label}
      </span>
    </div>
  );
});

Header.displayName = "Header";

type MessageProps = {
  parts: MessagePart[];
};

export const ChatMessage: React.FC<MessageProps> = memo(({ parts }) => {
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
});

ChatMessage.displayName = "ChatMessage";
