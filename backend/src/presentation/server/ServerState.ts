/**
 * Enum representing the current operational state of the HTTP server.
 */
export enum ServerState {
  STOPPED = "STOPPED",
  STARTING = "STARTING",
  RUNNING = "RUNNING",
  STOPPING = "STOPPING",
  FAILED = "FAILED"
}
