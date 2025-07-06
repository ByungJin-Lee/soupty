import { Channel } from "~/types";
import { ChannelAvatar } from "./channel-avatar";
import { useChannelEdit } from "../../stores/channel-edit";

interface ChannelItemProps {
  channel: Channel;
  isSelected: boolean;
  onSelect: (channel: Channel) => void;
}

export const ChannelItem: React.FC<ChannelItemProps> = ({
  channel,
  isSelected,
  onSelect,
}) => {
  const { openEdit } = useChannelEdit();

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEdit(channel);
  };

  return (
    <div
      className={`p-2 rounded-lg flex gap-3 border cursor-pointer transition-colors relative group ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => onSelect(channel)}
    >
      <ChannelAvatar channel={channel} size={44} className="rounded" />
      <div className="flex-1">
        <div className="font-medium">{channel.label}</div>
        <div className="text-sm text-gray-500">{channel.id}</div>
      </div>
      <button
        onClick={handleEdit}
        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded text-xs text-gray-600"
        title="편집"
      >
        ✏️
      </button>
    </div>
  );
};
