/**
 * @description 이벤트를 관리하기 위한 원형 큐입니다. (capacity를 위해 만들었음)
 */
export default class CircularQueue<T> {
  private capacity: number;
  private buffer: (T | undefined)[];
  private head = 0;
  private size = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  public clear() {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.size = 0;
  }

  public push(item: T) {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;

    if (this.size < this.capacity) this.size++;
  }

  public getAll() {
    if (this.size === 0) return [];

    const result: T[] = [];
    const start = this.size < this.capacity ? 0 : this.head;

    for (let i = 0; i < this.size; i++) {
      const index = (start + i) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }

    return result;
  }

  public getLatest(n: number): T[] {
    // 0 이하의 값을 요청하면 빈 배열을 반환합니다.
    if (n <= 0) {
      return [];
    }

    // 요청된 갯수가 현재 사이즈보다 크면 현재 사이즈로 제한합니다.
    const count = Math.min(n, this.size);
    const result: T[] = [];

    for (let i = 1; i <= count; i++) {
      const index = (this.head - i + this.capacity) % this.capacity;
      const item = this.buffer[index];
      if (item !== undefined) {
        result.push(item);
      }
    }

    return result.reverse();
  }
}
