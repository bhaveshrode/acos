/**
 * LayoutRegion representing structural UI segments like Sidebar or Header.
 */
export class LayoutRegion {
  constructor(
    public readonly name: string,
    public readonly content: string = ""
  ) {
    Object.freeze(this);
  }
}
