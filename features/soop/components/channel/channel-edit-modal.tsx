"use client";

import { Modal } from "~/common/ui/modal";
import { useChannelEdit } from "../../stores/channel-edit";
import { ChannelForm } from "./channel-form";

export const ChannelEditModal: React.FC = () => {
  const {
    isOpen,
    mode,
    channel,
    close,
    submit,
    delete: deleteChannel,
  } = useChannelEdit();

  const title = mode === "create" ? "채널 생성" : "채널 수정";

  return (
    <Modal isOpen={isOpen} onClose={close} title={title} ignoreBackdropClick>
      <div className="w-96">
        <ChannelForm
          mode={mode}
          channel={channel}
          onSubmit={submit}
          onCancel={close}
          onDelete={mode === "edit" ? deleteChannel : undefined}
        />
      </div>
    </Modal>
  );
};
