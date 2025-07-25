import { useState } from "react";
import { convertToKST } from "~/common/utils";
import { updateBroadcastSessionEndTime } from "~/services/ipc/broadcast-session";
import { BroadcastSession } from "~/services/ipc/types";

const getDefaultEndTime = (session: BroadcastSession): string => {
  if (session.endedAt) {
    return convertToKST(session.endedAt);
  }

  return "";
};

export const useBroadcastSessionEndTime = (session: BroadcastSession) => {
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [endTime, setEndTime] = useState(getDefaultEndTime(session));

  const handleSetEndTime = () => {
    if (!session.endedAt) {
      const now = new Date().toISOString();
      setEndTime(now);
    }
    setIsEditingEndTime(true);
  };

  const handleSaveEndTime = async () => {
    try {
      const delta = new Date(endTime);
      delta.setHours(delta.getHours());
      console.log(delta.toISOString());
      await updateBroadcastSessionEndTime(session.id, delta.toISOString());
      session.endedAt = endTime;
      setIsEditingEndTime(false);
    } catch (error) {
      console.error("Failed to update end time:", error);
    }
  };

  const handleCancelEdit = () => {
    setEndTime(getDefaultEndTime(session));
    setIsEditingEndTime(false);
  };

  return {
    isEditingEndTime,
    endTime,
    setEndTime,
    handleSetEndTime,
    handleSaveEndTime,
    handleCancelEdit,
  };
};
