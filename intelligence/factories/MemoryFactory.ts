import { MemoryStore } from "../memory/MemoryStore.js";

export class MemoryFactory {
  private static store: MemoryStore | null = null;

  public getMemoryStore(): MemoryStore {
    if (!MemoryFactory.store) {
      MemoryFactory.store = new MemoryStore();
    }
    return MemoryFactory.store;
  }
}
