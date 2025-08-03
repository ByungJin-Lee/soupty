import { ChatLogResult } from "~/services/ipc/types";

interface HistoryChatContentProps {
  chatLog: ChatLogResult;
}

export const HistoryChatContent: React.FC<HistoryChatContentProps> = ({
  chatLog,
}) => {
  if (chatLog.messageType === "EMOTICON" && chatLog.metadata?.emoticon) {
    const { id, number, ext, version } = chatLog.metadata.emoticon;
    const imageUrl = `https://ogq-sticker-global-cdn-z01.sooplive.co.kr/sticker/${id}/${number}_80.${ext}?ver=${version}`;

    return (
      <div className="flex items-center gap-2">
        {chatLog.message && (
          <span className="text-gray-900">{chatLog.message}</span>
        )}
        <img
          src={imageUrl}
          alt="OGQ 이모티콘"
          className="w-8 h-8"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return <div className="text-gray-900">{chatLog.message}</div>;
};
