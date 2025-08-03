import { ChatRow } from "~/features/chat/components/chat-row";
import { DomainEvent, DomainEventType } from "~/types";
import { DonationRow } from "./events/donation";
import { EnterRow, ExitRow } from "./events/enter-exit";
import { GiftRow } from "./events/gift";
import {
  BJStateChangeRow,
  ConnectedRow,
  DisconnectedRow,
} from "./events/lifecycle";
import {
  BattleMissionResultRow,
  ChallengeMissionResultRow,
  MissionDonationRow,
  MissionTotalRow,
} from "./events/mission";
import {
  BlackRow,
  FreezeRow,
  KickCancelRow,
  KickRow,
  MuteRow,
  SlowRow,
} from "./events/moderation";
import { NotificationRow } from "./events/notification";
import { StickerRow } from "./events/sticker";
import { SubscribeRow } from "./events/subscribe";

type Props = {
  data: DomainEvent;
};

export const EventRow: React.FC<Props> = ({ data }) => {
  switch (data.type) {
    // Lifecycle events
    case DomainEventType.Connected:
      return <ConnectedRow data={data.payload} />;
    case DomainEventType.Disconnected:
      return <DisconnectedRow data={data.payload} />;
    case DomainEventType.BJStateChange:
      return <BJStateChangeRow data={data.payload} />;

    // Chat related events
    case DomainEventType.Chat:
      return <ChatRow data={data.payload} />;
    case DomainEventType.Donation:
      return <DonationRow data={data.payload} />;
    case DomainEventType.Subscribe:
      return <SubscribeRow data={data.payload} />;
    case DomainEventType.Sticker:
      return <StickerRow data={data.payload} />;
    case DomainEventType.Gift:
      return <GiftRow data={data.payload} />;

    // User events
    case DomainEventType.Enter:
      return <EnterRow data={data.payload} />;
    case DomainEventType.Exit:
      return <ExitRow data={data.payload} />;

    // Moderation events
    case DomainEventType.Kick:
      return <KickRow data={data.payload} />;
    case DomainEventType.KickCancel:
      return <KickCancelRow data={data.payload} />;
    case DomainEventType.Mute:
      return <MuteRow data={data.payload} />;
    case DomainEventType.Black:
      return <BlackRow data={data.payload} />;
    case DomainEventType.Freeze:
      return <FreezeRow data={data.payload} />;
    case DomainEventType.Slow:
      return <SlowRow data={data.payload} />;

    // Mission events
    case DomainEventType.MissionDonation:
      return <MissionDonationRow data={data.payload} />;
    case DomainEventType.MissionTotal:
      return <MissionTotalRow data={data.payload} />;
    case DomainEventType.ChallengeMissionResult:
      return <ChallengeMissionResultRow data={data.payload} />;
    case DomainEventType.BattleMissionResult:
      return <BattleMissionResultRow data={data.payload} />;

    // System events
    case DomainEventType.Notification:
      return <NotificationRow data={data.payload} />;

    case DomainEventType.MetadataUpdate:
      break;
    default:
      return (
        <div className="my-0.5 p-1 rounded-md bg-gray-100">
          알 수 없는 이벤트
        </div>
      );
  }
};
