import { useState } from "react";
import { Radio, X } from "react-feather";
import { BroadcastSessionSelectorModal } from "~/features/broadcast";
import {
  BroadcastSession,
  SimplifiedBroadcastSession,
} from "~/services/ipc/types";

type Props = {
  broadcastSession?: SimplifiedBroadcastSession;
  onSelect(session?: BroadcastSession): void;
};

export const BroadcastSessionCondition: React.FC<Props> = ({
  broadcastSession,
  onSelect,
}) => {
  const [openModal, setOpenModal] = useState(false);

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleSelectSession = (session: BroadcastSession) => {
    onSelect(session);
    setOpenModal(false);
  };

  const getSessionDisplayText = () => {
    if (!broadcastSession) return "방송 세션 필터";

    return broadcastSession.title;
  };

  return (
    <>
      <div
        onClick={() => setOpenModal(true)}
        className="flex items-center py-1.5 px-2 bg-gray-200 rounded-md text-sm gap-2 cursor-pointer"
      >
        {broadcastSession ? (
          <>
            <Radio size={16} className="text-gray-600" />
            <span className="truncate max-w-48">{getSessionDisplayText()}</span>
            <button className="py-1" onClick={handleReset}>
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <Radio className="w-4 h-4 text-gray-500" />
            </div>
            <span>방송 세션 필터</span>
          </>
        )}
      </div>
      <BroadcastSessionSelectorModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSelectSession={handleSelectSession}
      />
    </>
  );
};
