/**
 * StateSnapshot representing deep-frozen read-only states snapshots trees.
 */
export class StateSnapshot<T = any> {
  constructor(
    public readonly data: T,
    public readonly timestamp: number = Date.now()
  ) {
    this.deepFreeze(this.data);
    Object.freeze(this);
  }

  private deepFreeze(obj: any): any {
    if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
      Object.freeze(obj);
      Object.keys(obj).forEach((key) => this.deepFreeze(obj[key]));
    }
    return obj;
  }
}
