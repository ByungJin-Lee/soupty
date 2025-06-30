import { DomainEvent, DomainEventType } from "~/types";
import { DonationRow } from "./events/donation";
import { SubscribeRow } from "./events/subscribe";

type Props = {
  data: DomainEvent;
};

export const EventRow: React.FC<Props> = ({ data }) => {
  switch (data.type) {
    case DomainEventType.Donation:
      return <DonationRow data={data.payload} />;
    case DomainEventType.Subscribe:
      return <SubscribeRow data={data.payload} />;
  }
};
