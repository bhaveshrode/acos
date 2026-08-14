/**
 * EventParser deserializing raw string bodies.
 */
export class EventParser {
  public parse(payload: string): Record<string, any> {
    return JSON.parse(payload);
  }
}
