/**
 * IActionHandler contract interface representing action mapping logic.
 */
export interface IActionHandler<TState, A = any> {
  handle(state: TState, action: { type: string; payload: A }): void;
}
