import { JsonSerializer } from "./JsonSerializer.js";
import { SerializationContext } from "./SerializationContext.js";

/**
 * ResponseSerializer producing standardized HTTP response representations.
 */
export class ResponseSerializer {
  constructor(private readonly jsonSerializer: JsonSerializer) {}

  public serializeResponse(data: any, context?: SerializationContext): string {
    return this.jsonSerializer.serialize(data, context);
  }
}
