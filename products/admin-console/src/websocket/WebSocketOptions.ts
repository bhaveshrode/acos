/**
 * WebSocketOptions defining reconnection configurations and heartbeat intervals.
 */
export interface WebSocketOptions {
  endpoint: string;
  heartbeatIntervalMs?: number;
  maxReconnectionAttempts?: number;
  reconnectionDelayMs?: number;
  bufferSize?: number;
}
