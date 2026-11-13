/**
 * ComponentSlot representing target markup placeholders within layouts.
 */
export class ComponentSlot {
  constructor(
    public readonly name: string,
    public readonly defaultContent: string = ""
  ) {
    Object.freeze(this);
  }
}
