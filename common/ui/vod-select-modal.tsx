"use client";
import { useEffect, useState } from "react";
import { Play, Video } from "react-feather";
import { ChannelCondition } from "~/features/condition";
import { VODItem } from "~/features/vod/components/vod-item";
import ipcService from "~/services/ipc";
import { StreamerVOD } from "~/services/ipc/types";
import { Channel } from "~/types";
import { useVodSelectStore } from "../stores/vod-select-modal-store";
import { Modal } from "./modal";

export const VodSelectModal: React.FC = () => {
  const { status, title, selectedChannelId, confirm, cancel } =
    useVodSelectStore();
  const [channel, setChannel] = useState<Channel>();
  const [vods, setVODs] = useState<StreamerVOD[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVod, setSelectedVod] = useState<StreamerVOD | null>(null);

  const handleClose = () => cancel();
  const handleConfirm = () => confirm(selectedVod);

  useEffect(() => {
    if (status === "waiting" && selectedChannelId) {
      setChannel({ id: selectedChannelId, label: selectedChannelId });
    }
  }, [status, selectedChannelId]);

  useEffect(() => {
    if (!channel) {
      setVODs([]);
      setSelectedVod(null);
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

  useEffect(() => {
    if (status === "idle") {
      setChannel(undefined);
      setVODs([]);
      setSelectedVod(null);
    }
  }, [status]);

  const handleVodSelect = (vod: StreamerVOD) => {
    setSelectedVod(selectedVod?.id === vod.id ? null : vod);
  };

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
            VOD 목록을 보려면 채널을 선택해주세요.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70svh] overflow-y-auto p-1">
        {vods.map((vod) => (
          <div
            key={vod.id}
            onClick={() => handleVodSelect(vod)}
            className={`cursor-pointer transition-all ${
              selectedVod?.id === vod.id && "ring-2 ring-blue-500 bg-blue-50"
            } rounded-lg`}
          >
            <VODItem data={vod} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={status === "waiting"} onClose={handleClose} title={title}>
      <div className="w-full max-w-4xl">
        <p className="text-gray-600 text-sm mb-6">
          연결할 VOD를 선택해주세요. 선택된 VOD는 방송 세션과 연결됩니다.
        </p>

        <div className="mb-4 w-fit">
          <ChannelCondition channel={channel} onSelect={setChannel} />
        </div>

        {renderContent()}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClose}
            className="px-4 py-1.5 text-gray-600 hover:text-gray-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedVod}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              selectedVod
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            선택
          </button>
        </div>
      </div>
    </Modal>
  );
};
