import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { prompt } from "~/common/stores/prompt-modal-store";
import {
  addTargetUser,
  getTargetUsers,
  removeTargetUser,
} from "~/common/utils/target-users";
import { ipcService } from "~/services/ipc";

export const FavoritesSettingsTab = () => {
  const [targetUsers, setTargetUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTargetUsers = async () => {
    try {
      setLoading(true);
      const users = await ipcService.targetUsers.getTargetUsers();
      setTargetUsers(users);
    } catch (error) {
      console.error("Failed to load target users:", error);
      toast.error("즐겨찾기 사용자 목록을 불러오는데 실패했습니다.");

      // 실패 시 로컬 캐시에서 가져오기
      const cachedUsers = Array.from(getTargetUsers());
      setTargetUsers(cachedUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      const userId = await prompt("추가할 사용자 이름을 입력하세요.");
      if (!userId || userId.trim() === "") return;

      const trimmedUserId = userId.trim();

      if (targetUsers.includes(trimmedUserId)) {
        toast.error("이미 등록된 사용자입니다.");
        return;
      }

      await addTargetUser(trimmedUserId);
      setTargetUsers((prev) => [...prev, trimmedUserId]);
      toast.success(`${trimmedUserId}님을 즐겨찾기에 추가했습니다.`);
    } catch (error) {
      console.error("Failed to add target user:", error);
      toast.error("사용자 추가에 실패했습니다.");
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeTargetUser(userId);
      setTargetUsers((prev) => prev.filter((user) => user !== userId));
      toast.success(`${userId}님을 즐겨찾기에서 제거했습니다.`);
    } catch (error) {
      console.error("Failed to remove target user:", error);
      toast.error("사용자 제거에 실패했습니다.");
    }
  };

  useEffect(() => {
    loadTargetUsers();
  }, []);

  if (loading) {
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
                <span>{user}</span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveUser(user)}
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
