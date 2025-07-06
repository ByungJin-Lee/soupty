"use client";

import { Suspense } from "react";
import { Modal } from "~/common/ui/modal";
import { Channel } from "~/types";
import { ErrorState, LoadingState } from "./channel-states";
import { ErrorBoundary } from "~/common/ui/error-boundary";
import ChannelContent from "./channel-content";

interface ChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChannel?: (channel: Channel) => void;
}

export const ChannelSelectModal: React.FC<ChannelModalProps> = ({
  isOpen,
  onClose,
  onSelectChannel,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="채널 선택">
      <div className="w-96 max-h-96">
        <ErrorBoundary fallback={<ErrorState />}>
          <Suspense fallback={<LoadingState />}>
            <ChannelContent onClose={onClose} onSelectChannel={onSelectChannel} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Modal>
  );
};
