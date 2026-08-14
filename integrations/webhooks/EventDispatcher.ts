/**
 * EventDispatcher invoking targeted callback triggers.
 */
export class EventDispatcher {
  public async dispatch(
    callback: (payload: any) => Promise<void>,
    eventData: Record<string, any>
  ): Promise<boolean> {
    try {
      await callback(eventData);
      return true;
    } catch {
      return false;
    }
  }
}
