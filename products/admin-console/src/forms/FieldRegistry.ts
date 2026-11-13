/**
 * FieldRegistry storing reusable field templates.
 */
export class FieldRegistry {
  private readonly catalog = new Map<string, any>();
  private isFrozen: boolean = false;

  public register(type: string, fieldClass: any): void {
    if (this.isFrozen) {
      throw new Error("FieldRegistry is frozen and cannot accept further field types");
    }
    this.catalog.set(type, fieldClass);
  }

  public get(type: string): any | undefined {
    return this.catalog.get(type);
  }

  public freeze(): void {
    this.isFrozen = true;
  }
}
