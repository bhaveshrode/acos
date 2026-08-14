import { IStateStore } from "./IStateStore.js";
import { StateSnapshot } from "./StateSnapshot.js";

/**
 * HistoryManager coordinating undo, redo, and history depth bounds pruning.
 */
export class HistoryManager {
  private undoStack: StateSnapshot[] = [];
  private redoStack: StateSnapshot[] = [];

  constructor(
    private readonly store: IStateStore,
    private readonly limit: number = 20
  ) {
    this.undoStack.push(store.getSnapshot());
  }

  public record(snapshot: StateSnapshot): void {
    this.undoStack.push(snapshot);
    this.redoStack = [];
    if (this.undoStack.length > this.limit) {
      this.undoStack.shift();
    }
  }

  public undo(): boolean {
    if (this.undoStack.length <= 1) return false;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    const previous = this.undoStack[this.undoStack.length - 1];
    this.store.update((state) => {
      Object.assign(state as any, previous.data);
    });
    return true;
  }

  public redo(): boolean {
    if (this.redoStack.length === 0) return false;
    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    this.store.update((state) => {
      Object.assign(state as any, next.data);
    });
    return true;
  }

  public getUndoStack(): StateSnapshot[] {
    return [...this.undoStack];
  }

  public getRedoStack(): StateSnapshot[] {
    return [...this.redoStack];
  }
}
