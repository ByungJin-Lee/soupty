import { useChannelEdit } from "../../stores/channel-edit";

export const ChannelAddButton: React.FC = () => {
  const { openCreate } = useChannelEdit();

  return (
    <div
      onClick={openCreate}
      className="p-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 cursor-pointer transition-colors box-border flex items-center justify-center h-[62px] text-gray-500 hover:text-blue-500"
    >
      <div className="text-center">
        <div className="text-2xl mb-1">+</div>
        <div className="text-xs">추가</div>
      </div>
    </div>
  );
};
