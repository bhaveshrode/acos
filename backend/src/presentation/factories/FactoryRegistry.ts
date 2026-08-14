/**
 * FactoryRegistry cataloging registered creators lookup.
 */
export class FactoryRegistry {
  private static creators = new Map<string, (context: any) => any>();

  public static register(key: string, creator: (context: any) => any): void {
    this.creators.set(key, creator);
  }

  public static get(key: string): ((context: any) => any) | undefined {
    return this.creators.get(key);
  }

  /**
   * Resets registry records.
   */
  public static clear(): void {
    this.creators.clear();
  }
}
