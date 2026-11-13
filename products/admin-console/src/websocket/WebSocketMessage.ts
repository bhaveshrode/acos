/**
 * WebSocketMessage wrapping communication payload packets.
 */
export class WebSocketMessage {
  constructor(
    public readonly type: string,
    public readonly payload: any = null,
    public readonly channel?: string,
    public readonly timestamp: number = Date.now()
  ) {
    Object.freeze(this);
  }
}
