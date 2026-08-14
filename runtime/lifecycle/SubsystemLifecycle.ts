/**
 * SubsystemLifecycle capturing lifecycle states.
 */
export enum SubsystemLifecycle {
  UNINITIALIZED = "UNINITIALIZED",
  INITIALIZING = "INITIALIZING",
  INITIALIZED = "INITIALIZED",
  READY = "READY",
  DRAINING = "DRAINING",
  STOPPED = "STOPPED"
}
