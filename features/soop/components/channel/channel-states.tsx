export const LoadingState: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="text-gray-500">채널 목록을 불러오는 중...</div>
    </div>
  );
};

export const ErrorState: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="text-red-500">
        채널 목록을 불러오는데 실패했습니다.
      </div>
    </div>
  );
};

export const EmptyState: React.FC = () => {
  return (
    <div className="flex justify-center py-8">
      <div className="text-gray-500">등록된 채널이 없습니다.</div>
    </div>
  );
};