import { JsonSerializer } from "./JsonSerializer.js";

/**
 * RequestDeserializer parsing HTTP input requests body parameters.
 */
export class RequestDeserializer {
  constructor(private readonly jsonSerializer: JsonSerializer) {}

  /**
   * Translates payload strings or buffers into strongly typed targets.
   */
  public deserialize<T>(body: string | Buffer): T {
    const payload = body instanceof Buffer ? body.toString("utf-8") : body;
    return this.jsonSerializer.deserialize<T>(payload);
  }
}
