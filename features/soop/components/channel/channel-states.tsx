import { useChannelEdit } from "../../stores/channel-edit";

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
      <div className="text-red-500">채널 목록을 불러오는데 실패했습니다.</div>
    </div>
  );
};

export const EmptyState: React.FC = () => {
  const { openCreate } = useChannelEdit();

  return (
    <div className="flex flex-col gap-y-2 py-8">
      <div className="text-gray-500 text-center">채널이 없습니다.</div>
      <div
        onClick={openCreate}
        className="p-1 px-2 rounded-lg cursor-pointer text-white bg-blue-500 w-fit mx-auto"
      >
        <div className="text-center">
          <span className="text-xl mr-1">+</span>
          <span className="text-md">추가</span>
        </div>
      </div>
    </div>
  );
};
