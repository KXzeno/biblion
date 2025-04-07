import type {
  SpaceProgressRecord,
} from './types/SpaceAugment.types';

export abstract class SpaceAugment {
  protected record: SpaceProgressRecord = {
    hits: 0,
    failed: 0,
    deficit: 0,
  };

  constructor(record?: SpaceProgressRecord) {
    if (record) {
      this.record = record;
    }
  }

  protected reset(): void {
    this.record = {
      hits: 0,
      failed: 0,
      deficit: 0,
    }
  }

  protected abstract space(): [number, number];
}
