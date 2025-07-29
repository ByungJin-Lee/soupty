import { formatDuration, formatTimestamp } from "~/common/utils";
import ipcService from "~/services/ipc";
import { StreamerVOD } from "~/services/ipc/types";

type Props = {
  data: StreamerVOD;
};

export const VODItem: React.FC<Props> = ({ data }) => {
  const handleClick = async () => {
    const detail = await ipcService.soop.getVODDetail(data.id);
    console.log(detail);
  };

  return (
    <div className="p-2 min-w-0" onClick={handleClick}>
      <img
        src={data.thumbnailUrl}
        referrerPolicy="no-referrer"
        className="rounded-md block"
        alt=""
      />
      <p
        title={data.title}
        className="text-ellipsis overflow-hidden text-nowrap"
      >
        {data.title}
      </p>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-500">{formatTimestamp(data.regDate)}</span>
        <span className="">{formatDuration(data.duration / 1000)}</span>
      </div>
    </div>
  );
};
