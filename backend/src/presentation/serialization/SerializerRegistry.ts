/**
 * SerializerRegistry catalog ledger mapping content media types and custom data type converters.
 */
export class SerializerRegistry {
  private static converters = new Map<string, any>();
  private static serializers = new Map<string, any>();

  public static registerConverter(name: string, converter: any): void {
    this.converters.set(name, converter);
  }

  public static getConverter(name: string): any | undefined {
    return this.converters.get(name);
  }

  public static registerSerializer(mediaType: string, serializer: any): void {
    this.serializers.set(mediaType, serializer);
  }

  public static getSerializer(mediaType: string): any | undefined {
    return this.serializers.get(mediaType);
  }

  /**
   * Clears registry ledger map records.
   */
  public static clear(): void {
    this.converters.clear();
    this.serializers.clear();
  }
}
