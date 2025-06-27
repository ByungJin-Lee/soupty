import { Fragment } from "react";
import { MessagePart, MessageType } from "~/types/chat";
import { ChatEvent } from "~/types/event";

type Props = {
  data: ChatEvent;
};

export const ChatRow: React.FC<Props> = ({ data }) => {
  return (
    <div className="">
      <span>{data.user.label}</span>
      <ChatMessage parts={data.parts} />
    </div>
  );
};

type MessageProps = {
  parts: MessagePart[];
};

export const ChatMessage: React.FC<MessageProps> = ({ parts }) => {
  return (
    <>
      {parts.map((p, i) => {
        let content: React.ReactNode = null;

        switch (p.type) {
          case MessageType.Text:
            content = p.value;
            break;
          case MessageType.Emoji:
            content = (
              <img
                title={p.value.title}
                src={p.value.imageUrl}
                referrerPolicy="no-referrer"
              />
            );
            break;
          case MessageType.OGQ:
            break;
        }

        return <Fragment key={i}>{content}</Fragment>;
      })}
    </>
  );
};
