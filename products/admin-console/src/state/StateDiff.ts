/**
 * StateDiff modelling addition, deletion, and modification metrics on state changes.
 */
export class StateDiff {
  constructor(
    public readonly added: Readonly<Record<string, any>>,
    public readonly removed: Readonly<Record<string, any>>,
    public readonly modified: Readonly<Record<string, { from: any; to: any }>>,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this.added);
    Object.freeze(this.removed);
    Object.freeze(this.modified);
    Object.freeze(this);
  }
}
