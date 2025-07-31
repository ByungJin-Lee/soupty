import { Save, X } from "react-feather";
import { DateTimePicker } from "~/common/ui";
import { formatTimestamp } from "~/common/utils";
import { useBroadcastSessionEndTime } from "~/features/report/hooks";
import { BroadcastSession } from "~/types";

type Props = {
  session: BroadcastSession;
};

export const BroadcastSessionEnd: React.FC<Props> = ({ session }) => {
  const {
    isEditing,
    handleSave,
    handleCancel,
    handleEdit,
    endTime,
    changeEndTime,
  } = useBroadcastSessionEndTime(session);

  return (
    <div className="space-y-1">
      <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide flex items-center justify-between">
        종료 시간
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-md transition-colors"
          >
            수정
          </button>
        )}
      </dt>
      {session.endedAt || isEditing ? (
        <dd className="text-lg text-gray-900 bg-red-50 px-3 py-1 rounded-md border border-red-200">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <DateTimePicker
                selected={endTime}
                onChange={changeEndTime}
                placeholderText="종료 시간 선택"
                className="text-sm border border-gray-300 rounded px-2 py-1 flex-1 w-full"
              />
              <button
                onClick={handleSave}
                className="text-xs bg-green-100 hover:bg-green-200 text-green-700  rounded transition-colors"
              >
                <Save size={15} />
              </button>
              <button
                onClick={handleCancel}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700  rounded transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            <span className="font-medium">🕐 {formatTimestamp(endTime!)}</span>
          )}
        </dd>
      ) : (
        <dd className="text-lg text-gray-500 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
          <span className="font-medium italic">미설정</span>
        </dd>
      )}
    </div>
  );
};
