/**
 * PageState enum capturing structural page lifecycles.
 */
export enum PageState {
  Initializing = "Initializing",
  Loading = "Loading",
  Ready = "Ready",
  Refreshing = "Refreshing",
  Error = "Error",
  Destroyed = "Destroyed"
}
