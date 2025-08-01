"use client";

import { Modal } from "~/common/ui/modal";
import { PaginationProvider } from "~/common/ui/pagination-provider";
import { useLiveUserHistory } from "../../hooks/live-user-history";
import { useLiveUserHistoryStore } from "../../stores/live-user-history";
import { LiveUserHistoryRow } from "./live-user-history-row";

type Props = {
  userId: string;
};

const LiveUserHistoryContent: React.FC<Props> = ({ userId }) => {
  const { histories } = useLiveUserHistory(userId);

  return (
    <div className="min-w-[400px] overflow-y-auto h-[500px]">
      {histories.map((v) => (
        <LiveUserHistoryRow key={v.id} data={v} />
      ))}
    </div>
  );
};

export const LiveUserHistoryModal = () => {
  const { userId, username, close } = useLiveUserHistoryStore();

  return (
    <Modal
      isOpen={!!userId}
      onClose={close}
      title={`'${username}(${userId})' 라이브 기록`}
      ignoreBackdropClick
    >
      <PaginationProvider>
        {userId && <LiveUserHistoryContent userId={userId} />}
      </PaginationProvider>
    </Modal>
  );
};
