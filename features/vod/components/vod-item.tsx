import { openUrl } from "@tauri-apps/plugin-opener";
import { Calendar, Clock, Play } from "react-feather";
import {
  formatDuration,
  formatTimestamp,
  transformVODURL,
} from "~/common/utils";
import { StreamerVOD } from "~/services/ipc/types";

type Props = {
  data: StreamerVOD;
};

export const VODItem: React.FC<Props> = ({ data }) => {
  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-full">
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-gray-100">
        <img
          src={
            data.thumbnailUrl.length > 0
              ? data.thumbnailUrl
              : "/images/default.png"
          }
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          alt=""
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center">
          <div
            className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all duration-200"
            onClick={() => openUrl(transformVODURL(data.id))}
          >
            <Play
              className="w-5 h-5 text-gray-700 ml-0.5"
              fill="currentColor"
            />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(data.duration / 1000)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3
          title={data.title}
          className="font-medium text-gray-900 mb-2 line-clamp-2 leading-tight"
        >
          {data.title}
        </h3>

        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <Calendar className="w-3 h-3" />
          <span>{formatTimestamp(data.regDate)}</span>
        </div>
      </div>
    </div>
  );
};
