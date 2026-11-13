import { describe, it, expect, beforeEach, vi } from "vitest";
import { StateSnapshot } from "../StateSnapshot.js";
import { StateOptions } from "../StateOptions.js";
import { StateChange } from "../StateChange.js";
import { StateStore } from "../StateStore.js";
import { StateRegistry } from "../StateRegistry.js";
import { CustomerStore, CustomerState } from "../CustomerStore.js";
import { IdentityStore, IdentityState } from "../IdentityStore.js";
import { StateSelector } from "../StateSelector.js";
import { StateUpdater } from "../StateUpdater.js";
import { StateDispatcher } from "../StateDispatcher.js";
import { IActionHandler } from "../IActionHandler.js";
import { StateObserver } from "../StateObserver.js";
import { LocalStorageStatePersistence } from "../LocalStorageStatePersistence.js";
import { StateHydrator } from "../StateHydrator.js";
import { HydrationResult } from "../HydrationResult.js";
import { HistoryManager } from "../HistoryManager.js";
import { StateDiff } from "../StateDiff.js";
import { StateDiffCalculator } from "../StateDiffCalculator.js";
import { StateFactory } from "../StateFactory.js";

describe("Frontend State Component Refactored Unit Tests (Task 66.8)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    StateSelector.clearCache();
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("Models & Stores", () => {
    it("should deep freeze state values inside StateSnapshot", () => {
      const complexState = { nested: { count: 1 }, list: [1, 2] };
      const snapshot = new StateSnapshot(complexState);

      expect(Object.isFrozen(snapshot)).toBe(true);
      expect(Object.isFrozen(snapshot.data)).toBe(true);
      expect(Object.isFrozen(snapshot.data.nested)).toBe(true);
      expect(Object.isFrozen(snapshot.data.list)).toBe(true);
    });

    it("should support updates and subscriptions in StateStore", () => {
      const store = new StateStore({ count: 10 });
      let callCount = 0;
      store.subscribe((state) => {
        callCount++;
        expect(state.count).toBe(42);
      });

      store.update((s) => {
        s.count = 42;
      });

      expect(store.getState().count).toBe(42);
      expect(callCount).toBe(1);
    });

    it("should register feature stores and support registry freezing", () => {
      const registry = new StateRegistry();
      const store = new StateStore({ active: true });
      registry.register("auth", store);

      expect(registry.getStore("auth")).toBe(store);
      expect(registry.getStore("non_existent")).toBeUndefined();

      registry.freeze();
      expect(() => registry.register("payment", store)).toThrow(
        "StateRegistry is frozen and cannot accept further stores"
      );
    });
  });

  describe("Feature Stores Coordination", () => {
    it("should coordinate state loading and payload responses in CustomerStore", async () => {
      const baseStore = new StateStore<CustomerState>({
        customers: [],
        activeCustomer: null,
        loading: false,
        error: null
      });

      const mockApi = {
        getCustomer: async (id: string) => ({ data: { id, name: "Alice" } }),
        createCustomer: async (payload: any) => ({ data: payload })
      } as any;

      const customerStore = new CustomerStore(baseStore, mockApi);
      await customerStore.fetchCustomer("c-1");

      expect(customerStore.getState().activeCustomer).toEqual({ id: "c-1", name: "Alice" });
      expect(customerStore.getState().loading).toBe(false);
      expect(customerStore.getState().error).toBeNull();
    });

    it("should coordinate registration and login errors in IdentityStore", async () => {
      const baseStore = new StateStore<IdentityState>({
        isAuthenticated: false,
        currentUser: null,
        loading: false,
        error: null
      });

      const mockApi = {
        login: async () => {
          throw new Error("Invalid credentials");
        },
        register: async () => ({})
      } as any;

      const identityStore = new IdentityStore(baseStore, mockApi);
      await identityStore.login({ username: "wrong" });

      expect(identityStore.getState().isAuthenticated).toBe(false);
      expect(identityStore.getState().error).toBe("Invalid credentials");
      expect(identityStore.getState().loading).toBe(false);
    });
  });

  describe("Selection & Updates", () => {
    it("should compute memoized state slices via StateSelector", () => {
      const state = { sub: { value: "test" }, other: 123 };
      
      const selectFn = (s: typeof state) => s.sub.value;
      const res1 = StateSelector.select(state, selectFn, "cache_key");
      expect(res1).toBe("test");

      const res2 = StateSelector.select(state, selectFn, "cache_key");
      expect(res2).toBe("test");
    });

    it("should return deep-copied mutations via StateUpdater", () => {
      const state = { arr: [1, 2], val: "abc" };
      const next = StateUpdater.update(state, (draft) => {
        draft.arr.push(3);
        draft.val = "xyz";
      });

      expect(next).toEqual({ arr: [1, 2, 3], val: "xyz" });
      expect(state).toEqual({ arr: [1, 2], val: "abc" }); // Untouched
    });

    it("should dispatch via ActionHandler and observe slices returning subscription tokens", () => {
      const store = new StateStore({ value: "first" });
      
      const dispatcher = new StateDispatcher(store);
      const observer = new StateObserver(store);

      let observedVal = "";
      const token = observer.observe((s) => s.value, (val) => {
        observedVal = val;
      });

      const mockHandler: IActionHandler<{ value: string }, string> = {
        handle: (state, action) => {
          state.value = action.payload;
        }
      };

      dispatcher.dispatch("UPDATE_VAL", "second", mockHandler);

      expect(store.getState().value).toBe("second");
      expect(observedVal).toBe("second");

      token.dispose();
      dispatcher.dispatch("UPDATE_VAL", "third", mockHandler);
      expect(store.getState().value).toBe("third");
      expect(observedVal).toBe("second"); // subscription disposed, no callback trigger
    });
  });

  describe("Persistence & History time travel", () => {
    it("should serialize, save, and hydrate returning HydrationResult states", () => {
      const mockLocalStorage: Record<string, string> = {};
      (globalThis as any).localStorage = {
        setItem: (key: string, value: string) => {
          mockLocalStorage[key] = value;
        },
        getItem: (key: string) => mockLocalStorage[key] || null,
        clear: () => {}
      } as any;

      const store = new StateStore({ data: "initial" });
      const persistence = new LocalStorageStatePersistence();
      const hydrator = new StateHydrator(persistence);

      persistence.save("state_key", store.getSnapshot());
      expect(mockLocalStorage.state_key).toContain("initial");

      const otherStore = new StateStore({ data: "default" });
      const result = hydrator.hydrate("state_key", otherStore);

      expect(result).toBeInstanceOf(HydrationResult);
      expect(result.success).toBe(true);
      expect(result.status).toBe("Success");
      expect(otherStore.getState().data).toBe("initial");

      delete (globalThis as any).localStorage;
    });

    it("should support undo/redo time travel history states", () => {
      const store = new StateStore({ step: 1 });
      const history = new HistoryManager(store, 5);

      store.update((s) => { s.step = 2; });
      history.record(store.getSnapshot());

      store.update((s) => { s.step = 3; });
      history.record(store.getSnapshot());

      expect(store.getState().step).toBe(3);

      const undone = history.undo();
      expect(undone).toBe(true);
      expect(store.getState().step).toBe(2);

      const redone = history.redo();
      expect(redone).toBe(true);
      expect(store.getState().step).toBe(3);
    });

    it("should calculate rich differences via StateDiffCalculator", () => {
      const prev = { field1: "a", field2: "b" };
      const curr = { field1: "a", field2: "z", field3: "new" };

      const diff = StateDiffCalculator.calculateDiff(prev, curr);
      expect(diff).toBeInstanceOf(StateDiff);
      expect(diff.added.field3).toBe("new");
      expect(diff.modified.field2).toEqual({ from: "b", to: "z" });
      expect(Object.isFrozen(diff)).toBe(true);
    });
  });
});
