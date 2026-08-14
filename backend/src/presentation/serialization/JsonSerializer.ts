import { SerializationContext } from "./SerializationContext.js";
import { SerializationException } from "./SerializationException.js";

/**
 * JsonSerializer converting object topologies to and from string payloads.
 */
export class JsonSerializer {
  /**
   * Stringifies value, honoring prettyPrint format checks.
   */
  public serialize(value: any, context?: SerializationContext): string {
    try {
      const pretty = context?.options.prettyPrint ?? false;
      return JSON.stringify(value, null, pretty ? 2 : undefined);
    } catch (error: any) {
      throw new SerializationException(`Failed to serialize JSON: ${error.message}`);
    }
  }

  /**
   * Parses JSON string into structures.
   */
  public deserialize<T>(payload: string): T {
    try {
      return JSON.parse(payload) as T;
    } catch (error: any) {
      throw new SerializationException(`Failed to deserialize JSON: ${error.message}`);
    }
  }
}
