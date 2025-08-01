import { useSearchParams } from "next/navigation";
import { ErrorMessage, LoadingSpinner, NotFound } from "~/common/ui";
import { BroadcastSessionProvider } from "~/features/broadcast";
import { useBroadcastSessionDetail } from "~/features/report/hooks";
import { ReportSection } from "../sections/report-section";
import { BroadcastSessionHeader } from "../sections/session-header";

export const BroadcastSessionDetailPage = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

  const { session, isLoading, error } = useBroadcastSessionDetail(sessionId);

  if (isLoading) {
    return <LoadingSpinner message="세션 정보를 불러오는 중..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!session) {
    return <NotFound message="세션을 찾을 수 없습니다." />;
  }

  return (
    <div className="py-2 flex-1 print:!block overflow-y-scroll invisible-scrollbar print:!overflow-visible">
      <div className="max-w-4xl mx-auto print:!p-6">
        <BroadcastSessionProvider value={session}>
          <BroadcastSessionHeader session={session} />
          <ReportSection session={session} />
        </BroadcastSessionProvider>
      </div>
    </div>
  );
};
