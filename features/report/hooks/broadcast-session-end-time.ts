import { useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { convertToKST, convertToUTC } from "~/common/utils";
import { route } from "~/constants";
import { updateBroadcastSessionEndTime } from "~/services/ipc/broadcast-session";
import { BroadcastSession } from "~/services/ipc/types";

const getDefaultTime = (value: string | null | undefined) => {
  return value ? convertToKST(value) : null;
};

export const useBroadcastSessionEndTime = (session: BroadcastSession) => {
  const [isEditing, switchMode] = useState(false);
  const [endTime, changeEndTime] = useState(getDefaultTime(session.endedAt));

  const handleSave = async () => {
    try {
      if (!endTime) return;
      await updateBroadcastSessionEndTime(
        session.id,
        convertToUTC(endTime).toISOString()
      );
      switchMode(false);
      mutate(route.broadcastSession(session.id));
    } catch {
      toast.error("설정에 실패했습니다.");
    }
  };

  const handleCancel = () => {
    changeEndTime(getDefaultTime(session.endedAt));
    switchMode(false);
  };

  const handleEdit = () => {
    switchMode(true);
  };

  return {
    isEditing,
    endTime,
    handleSave,
    changeEndTime,
    handleEdit,
    handleCancel,
  };
};
