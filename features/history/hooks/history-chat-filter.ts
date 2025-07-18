import { useForm } from "react-hook-form";
import { Channel } from "~/types";

// Channel 선택, 사용자 아이디, 이벤트 종류, 방송 아이디, 날짜

interface ChatFilter {
  channel?: Channel;
  userId?: string;
  chatType?: string;
  sessionId?: string;
  startedAt?: string;
  endAt?: string;
}

export const useHistoryChatFilter = () => {
  return useForm<ChatFilter>({
    mode: "onChange",
    defaultValues: {},
  });
};
