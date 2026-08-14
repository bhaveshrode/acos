/**
 * LayoutSlot representing markup placeholders inside layout templates.
 */
export class LayoutSlot {
  constructor(
    public readonly name: string,
    public readonly defaultContent: string = ""
  ) {
    Object.freeze(this);
  }
}
