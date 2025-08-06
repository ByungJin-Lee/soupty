"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ChatProcessorProvider } from "~/features/chat/context/chat-processor";
import { useChatProcessor } from "~/features/chat/hooks/chat-processor";
import { HistoryUserLiveBlock } from "~/features/history-user/components/history-user-live-block";
import { HistoryUserPastBlock } from "~/features/history-user/components/history-user-past-block";
import {
  useHistoryUserData,
  useIntersectionObserver,
} from "~/features/history-user/hooks";

export default function HistoryUserPage() {
  return (
    <div className="flex-1 h-full">
      <Suspense>
        <PageContent />
      </Suspense>
    </div>
  );
}

const PageContent = () => {
  const params = useSearchParams();
  const userId = params.get("userId");
  const channelId = params.get("channelId");

  if (!userId || !channelId) {
    throw Error("파라미터가 존재하지 않습니다.");
  }

  const chatProcessor = useChatProcessor(channelId);

  if (!chatProcessor) {
    return null;
  }

  return (
    <ChatProcessorProvider value={chatProcessor}>
      <Content userId={userId} channelId={channelId} />
    </ChatProcessorProvider>
  );
};

type Props = {
  userId: string;
  channelId: string;
};

const Content: React.FC<Props> = ({ userId, channelId }) => {
  const {
    blocks,
    isLoading,
    hasMore,
    loadMoreData,
    isLoadingRef,
    availableDates,
    today,
  } = useHistoryUserData(userId, channelId);

  const { targetRef: loadMoreTriggerRef, rootRef: scrollContainerRef } =
    useIntersectionObserver({
      onIntersect: loadMoreData,
      enabled: hasMore && !isLoadingRef.current,
      maintainScrollPosition: true,
    });

  // 첫 로드시 맨 아래로 스크롤, 이후 로드시에는 위치 유지
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (blocks.length === 1 && availableDates.length > 0) {
      // 첫 번째 데이터 로드시 맨 아래로
      setTimeout(() => {
        container.scrollTop = container.scrollHeight;
      }, 100);
    }
  }, [blocks.length, availableDates.length, scrollContainerRef]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col h-full overflow-y-scroll"
    >
      {/* Intersection Observer용 트리거 (상단에 위치) */}
      {hasMore && blocks.length > 0 && (
        <div
          ref={loadMoreTriggerRef}
          className="h-1 w-full"
          style={{ minHeight: "1px" }}
        />
      )}

      {isLoading && blocks.length === 0 && (
        <div className="p-2 text-center text-gray-500">로딩 중...</div>
      )}

      {isLoading && blocks.length > 0 && (
        <div className="p-2 text-center text-gray-500 border-b">
          과거 데이터 로딩 중...
        </div>
      )}

      {!hasMore && blocks.length > 0 && (
        <div className="p-2 text-center text-gray-500">
          더 이상 불러올 데이터가 없습니다.
        </div>
      )}

      {blocks.length === 0 && !isLoading && (
        <div className="p-2 text-center text-gray-500">기록이 없습니다.</div>
      )}

      {blocks.map((block) => (
        <HistoryUserPastBlock key={block.date} block={block} />
      ))}

      <HistoryUserLiveBlock
        userId={userId}
        channelId={channelId}
        today={today}
      />
    </div>
  );
};
