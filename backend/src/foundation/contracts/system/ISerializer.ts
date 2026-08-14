import { Result } from "../../result/Result.js";

/**
 * Interface representing data serialization and deserialization capabilities.
 * Replaces direct JSON.stringify/JSON.parse calls to support custom date/value mappings.
 */
export interface ISerializer {
  /**
   * Serializes an object instance to a string format.
   * @param data The object to serialize.
   */
  serialize<T>(data: T): Result<string>;

  /**
   * Deserializes a string format back into an object instance of type T.
   * @param payload The serialized string.
   */
  deserialize<T>(payload: string): Result<T>;
}
