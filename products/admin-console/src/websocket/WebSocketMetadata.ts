/**
 * WebSocketMetadata storing protocols, endpoint URIs, and reconnection limits.
 */
export interface WebSocketMetadata {
  id: string;
  protocols?: string[];
  endpoint: string;
  reconnectionAttempts?: number;
  heartbeatIntervalMs?: number;
}
