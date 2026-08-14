/**
 * WebSocketState enum capturing real-time connection lifecycles.
 */
export enum WebSocketState {
  Disconnected = "Disconnected",
  Connecting = "Connecting",
  Connected = "Connected",
  Reconnecting = "Reconnecting",
  Closing = "Closing",
  Closed = "Closed"
}
