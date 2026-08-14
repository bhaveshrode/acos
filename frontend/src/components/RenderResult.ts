/**
 * RenderResult wrapping output templates, elapsed render duration, and metadata diagnostics.
 */
export class RenderResult {
  constructor(
    public readonly output: string,
    public readonly duration: number,
    public readonly diagnostics: Readonly<Record<string, any>> = {}
  ) {
    Object.freeze(this.diagnostics);
    Object.freeze(this);
  }
}
