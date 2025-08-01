import { toast } from "react-hot-toast";
import useSWR, { mutate } from "swr";
import { prompt } from "~/common/stores/prompt-modal-store";
import { ClipboardButton } from "~/common/ui";
import { addTargetUser, removeTargetUser } from "~/common/utils/target-users";
import { ipcService } from "~/services/ipc";

const CACHE_KEY = "/target-users";

export const FavoritesSettingsTab = () => {
  const { data: targetUsers, isLoading } = useSWR(CACHE_KEY, () =>
    ipcService.targetUsers.getTargetUsers()
  );

  const handleAddUser = async () => {
    if (!targetUsers || targetUsers.length > 0) return;

    try {
      const userId = await prompt("추가할 사용자 아이디을 입력하세요.");
      if (!userId || userId.trim() === "") return;

      const trimmedUserId = userId.trim();

      const username = await prompt(
        "추가할 사용자 이름을 입력하세요.(아무거나 가능)"
      );
      if (!username || username.trim() === "") return;
      const trimmedUsername = username.trim();

      if (targetUsers.find((v) => v.userId === userId)) {
        toast.error("이미 등록된 사용자입니다.");
        return;
      }

      const user = {
        userId: trimmedUserId,
        username: trimmedUsername,
      };

      await addTargetUser(user);
      mutate(CACHE_KEY);
      toast.success(`${trimmedUserId}님을 즐겨찾기에 추가했습니다.`);
    } catch {
      toast.error("사용자 추가에 실패했습니다.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeTargetUser(userId);
      mutate(CACHE_KEY);
      toast.success(`${userId}님을 즐겨찾기에서 제거했습니다.`);
    } catch {
      toast.error("사용자 제거에 실패했습니다.");
    }
  };

  if (isLoading || !targetUsers) {
    return (
      <div className="space-y-6 px-4">
        <div>
          <h3 className="text-lg font-medium mb-3">즐겨찾기 사용자</h3>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6  px-4">
      <div>
        <h3 className="text-lg font-medium mb-3">즐겨찾기 사용자</h3>
        <p className="text-sm text-gray-600 mb-3">
          관심있는 사용자를 즐겨찾기에 추가하세요.
        </p>

        {targetUsers.length === 0 ? (
          <p className="text-gray-500">등록된 즐겨찾기 사용자가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {targetUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded"
              >
                <div>
                  <span>{user.username}</span>
                  <span className="text-gray-400">({user.userId})</span>
                  <ClipboardButton value={user.userId} />
                </div>

                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveUser(user.userId)}
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-3 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleAddUser}
        >
          사용자 추가
        </button>
      </div>
    </div>
  );
};
