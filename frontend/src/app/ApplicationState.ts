/**
 * InitState representing lifecycle transitions.
 */
export enum InitState {
  Uninitialized = "Uninitialized",
  Initializing = "Initializing",
  Ready = "Ready",
  Shutdown = "Shutdown"
}

/**
 * ApplicationState monitoring initialization, ready, and shutdown states.
 */
export class ApplicationState {
  private state: InitState = InitState.Uninitialized;

  public transitionTo(nextState: InitState): void {
    this.state = nextState;
  }

  public get(): InitState {
    return this.state;
  }
}
