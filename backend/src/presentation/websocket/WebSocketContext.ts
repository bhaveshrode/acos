import { ConnectionState } from "./ConnectionState.js";

export interface WebSocketContextProps {
  connectionId: string;
  userId?: string;
  tenantId?: string;
  correlationId?: string;
  state: ConnectionState;
  lastHeartbeat?: Date;
}

/**
 * WebSocketContext carrying connection metadata card attributes.
 */
export class WebSocketContext {
  constructor(public readonly props: WebSocketContextProps) {}
}
