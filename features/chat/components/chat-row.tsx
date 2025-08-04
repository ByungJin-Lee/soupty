import { openUrl } from "@tauri-apps/plugin-opener";
import { Fragment, memo, useEffect, useRef } from "react";
import { useUserPopoverDispatch } from "~/features/popover/hooks/user-popover";
import { ChatEvent, MessagePart, MessageType } from "~/types/event";
import { ChatBadge } from "./chat-badge";

type Props = {
  data: ChatEvent;
  onMeasure?: (element: HTMLElement, itemId: string) => void;
};

export const ChatRow: React.FC<Props> = memo(({ data, onMeasure }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (rowRef.current && onMeasure) {
      onMeasure(rowRef.current, data.id);
    }
  }, [data.id, onMeasure]);

  return (
    <div ref={rowRef} className="flex gap-1 py-1 box-border">
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
    <button
      className="min-w-[120px] max-w-[120px] inline-block text-left cursor-pointer m-0 p-0 h-fit"
      onClick={handleClick}
    >
      {data.badges.map((b) => (
        <ChatBadge key={b} badge={b} />
      ))}
      <span
        className="break-all font-medium ml-1 align-middle"
        style={{ color: data.color }}
      >
        {data.user.label}
      </span>
      {/* </div> */}
    </button>
  );
});

Header.displayName = "Header";

type MessageProps = {
  parts: MessagePart[];
};

export const ChatMessage: React.FC<MessageProps> = memo(({ parts }) => {
  return (
    <div className="break-all mt-0.5">
      {parts.map((p, i) => {
        let content: React.ReactNode = null;

        switch (p.type) {
          case MessageType.Text:
            content = p.value;
            break;
          case MessageType.URL:
            content = (
              <span
                onClick={() => openUrl(p.value)}
                className="text-blue-400 cursor-pointer underline"
              >
                {p.value}
              </span>
            );
            break;
          case MessageType.Emoji:
            content = (
              <img
                className="inline-block mr-1"
                title={p.value.title}
                src={p.value.imageUrl}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "inline-block";
                }}
              />
            );
            break;
          case MessageType.OGQ:
            content = (
              <img
                className="inline-block mr-1 h-12"
                title="OGQ"
                src={p.value}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                onLoad={(e) => {
                  e.currentTarget.style.display = "inline-block";
                }}
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
