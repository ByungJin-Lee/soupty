"use client";

import { useEffect, useState } from "react";
import { Play, Video } from "react-feather";
import { ChannelCondition } from "~/features/condition";
import { VODItem } from "~/features/vod/components/vod-item";
import ipcService from "~/services/ipc";
import { StreamerVOD } from "~/services/ipc/types";
import { Channel } from "~/types";

export default function VODPage() {
  const [channel, setChannel] = useState<Channel>();
  const [vods, setVODs] = useState<StreamerVOD[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!channel) {
      setVODs([]);
      return;
    }

    setLoading(true);
    ipcService.soop
      .getStreamerVODList(channel.id, 1)
      .then((v) => {
        if (v) setVODs(v);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [channel]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">VOD 목록을 불러오는 중...</p>
        </div>
      );
    }

    if (!channel) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            채널을 선택해주세요
          </h3>
          <p className="text-gray-500 max-w-sm">
            VOD 목록을 보려면 위에서 채널을 선택해주세요.
          </p>
        </div>
      );
    }

    if (vods.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            VOD가 없습니다
          </h3>
          <p className="text-gray-500 max-w-sm">
            {channel.label}님의 VOD가 아직 없거나 불러올 수 없습니다.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vods.map((v) => (
          <VODItem key={v.id} data={v} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-scroll invisible-scrollbar">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VOD 목록</h1>
              <p className="text-gray-500 text-sm">
                {channel
                  ? `${channel.label}님의 VOD ${vods.length}개`
                  : "채널을 선택하여 VOD를 확인하세요"}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex items-center space-x-3">
          <ChannelCondition channel={channel} onSelect={setChannel} />
          {channel && (
            <div className="text-xs text-gray-500 px-3 py-2 bg-gray-50 rounded-md">
              최근 VOD 목록
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}
