import { DomainEvent } from "~/types";
import { EventDisplayUtil } from "../utils/event-display";

type Props = {
  data: DomainEvent;
};

export const EventRow: React.FC<Props> = ({ data }) => {
  return <>{EventDisplayUtil.exportEventRow(data)}</>;
};
