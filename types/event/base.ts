export interface DomainEvent<T> {
  type: string;
  payload: T;
}

export interface BaseEvent {
  /**
   * @description uuid
   */
  id: string;
  /**
   * @description 이벤트가 발생한 UTC 시간입니다. 인터넷 환경에 따라 차이가 있습니다.
   */
  timestamp: number;
}
