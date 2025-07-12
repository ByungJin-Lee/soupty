import { BaseEvent } from "./base";

export enum MissionType {
  Challenge = "Challenge",
  Battle = "Battle",
}

export interface MissionDonationEvent extends BaseEvent {
  channelId: string;
  from: string;
  fromLabel: string;
  amount: number;
  missionType: MissionType;
}

export interface MissionTotalEvent extends BaseEvent {
  channelId: string;
  missionType: MissionType;
  amount: number;
}

export interface ChallengeMissionResultEvent extends BaseEvent {
  channelId: string;
  isSuccess: boolean;
  title: string;
}

export interface BattleMissionResultEvent extends BaseEvent {
  channelId: string;
  isDraw: boolean;
  winner: string;
  title: string;
}
