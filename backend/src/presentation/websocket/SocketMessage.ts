/**
 * SocketMessage defining the structured format wrapper for all websocket dispatches.
 */
export class SocketMessage {
  constructor(
    public readonly type: string,
    public readonly payload: any,
    public readonly correlationId?: string
  ) {}
}
