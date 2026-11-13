import { ValidationEvent } from "./ValidationEvent.js";

/**
 * ValidationEventDispatcher publishing events to validation observers.
 */
export class ValidationEventDispatcher {
  private readonly listeners = new Set<(event: ValidationEvent) => void>();

  public dispatch(event: ValidationEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public subscribe(listener: (event: ValidationEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
