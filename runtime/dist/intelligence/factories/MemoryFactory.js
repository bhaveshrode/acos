import { MemoryStore } from "../memory/MemoryStore.js";
export class MemoryFactory {
    static store = null;
    getMemoryStore() {
        if (!MemoryFactory.store) {
            MemoryFactory.store = new MemoryStore();
        }
        return MemoryFactory.store;
    }
}
