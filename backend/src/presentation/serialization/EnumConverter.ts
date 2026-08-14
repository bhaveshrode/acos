/**
 * EnumConverter mapping keys and values across TypeScript enum structures.
 */
export class EnumConverter {
  public toValue<T>(enumObj: T, key: string): any {
    return (enumObj as any)[key];
  }

  public toKey<T>(enumObj: T, value: any): string | undefined {
    return Object.keys(enumObj as any).find((k) => (enumObj as any)[k] === value);
  }
}
