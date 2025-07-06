interface ChannelActionsProps {
  onCancel: () => void;
  onConfirm: () => void;
  disabled: boolean;
}

export const ChannelActions: React.FC<ChannelActionsProps> = ({ onCancel, onConfirm, disabled }) => {
  return (
    <div className="flex justify-end gap-2 mt-6">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-gray-600 hover:text-gray-800"
      >
        취소
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        확인
      </button>
    </div>
  );
};