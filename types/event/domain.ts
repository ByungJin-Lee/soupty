import { DonationEvent } from "./donation";
import { SubscribeEvent } from "./subscribe";

export enum DomainEventType {
  Donation = "Donation",
  Subscribe = "Subscribe",
}

export type RawDomainEvent = {
  type: DomainEventType;
  payload: {
    id: string;
  };
};

export interface _DomainEvent<T, P> {
  id: string;
  type: T;
  payload: P;
}

export type DomainEvent =
  | _DomainEvent<DomainEventType.Donation, DonationEvent>
  | _DomainEvent<DomainEventType.Subscribe, SubscribeEvent>;
