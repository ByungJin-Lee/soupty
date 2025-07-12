"use client";

import { DomainEvent } from "~/types/event/domain";
import { EventRow } from "./event-row";

type Props = {
  events: DomainEvent[];
  className?: string;
};

export const EventView: React.FC<Props> = ({ events, className = "" }) => {
  return (
    <div className={className}>
      {events.map((v) => (
        <EventRow key={v.id} data={v} />
      ))}
    </div>
  );
};