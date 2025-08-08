import { openUrl } from "@tauri-apps/plugin-opener";
import { mutate } from "swr";
import { selectVod } from "~/common/stores/vod-select-modal-store";
import { route } from "~/constants";
import { updateBroadcastSessionVODId } from "~/services/ipc/broadcast-session";
import { BroadcastSession } from "~/types";

type Props = {
  session: BroadcastSession;
};

export const BroadcastSessionVOD: React.FC<Props> = ({ session }) => {
  const handleSelectVOD = async () => {
    const vod = await selectVod("VOD 연결", session.channelId);
    if (vod) {
      await updateBroadcastSessionVODId(session.id, vod.id);
      mutate(route.broadcastSession(session.id));
    }
  };

  return (
    <div className="aspect-video">
      {session.vodId > 0 ? (
        <div>
          <iframe
            className="w-full h-full aspect-video"
            id="soop_player_video"
            src={`https://vod.sooplive.co.kr/player/${session.vodId}/embed?showChat=false&autoPlay=false&mutePlay=true`}
            frameBorder="0"
            allowFullScreen={true}
            allow="clipboard-write; web-share;"
          ></iframe>
          <div className="flex items-center justify-between">
            <span
              onClick={() =>
                openUrl(`https://vod.sooplive.co.kr/player/${session.vodId}`)
              }
              className="text-xs cursor-pointer text-right text-blue-400"
            >
              바로가기
            </span>
            <span
              onClick={handleSelectVOD}
              className="text-xs cursor-pointer text-right text-blue-400"
            >
              VOD 수정
            </span>
          </div>
        </div>
      ) : (
        <div
          onClick={handleSelectVOD}
          className="h-full flex items-center justify-center bg-blue-50 border border-blue-200 rounded-md cursor-pointer"
        >
          <span className="text-blue-400">VOD 연결</span>
        </div>
      )}
    </div>
  );
};
