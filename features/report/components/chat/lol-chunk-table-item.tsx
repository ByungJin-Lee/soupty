import { openUrl } from "@tauri-apps/plugin-opener";
import toast from "react-hot-toast";
import { FilteredLOLChunkItem, transformVODURL } from "~/common/utils";
import { useBroadcastSessionContext } from "~/features/broadcast";

type Props = {
  data: FilteredLOLChunkItem;
};

export const LOLChunkTableItem: React.FC<Props> = ({ data }) => {
  const session = useBroadcastSessionContext();

  const handleClick = () => {
    if (session.vodId) {
      openUrl(transformVODURL(session.vodId, data.seconds));
    } else {
      toast.error("VOD를 먼저 연결해주세요.");
    }
  };

  return (
    <>
      <td className="py-2 text-center">
        <span
          className="text-sm cursor-pointer text-blue-800"
          onClick={handleClick}
        >
          {data.timestamp}
        </span>
      </td>
      <td className="py-2 text-center">{data.score}</td>
    </>
  );
};
