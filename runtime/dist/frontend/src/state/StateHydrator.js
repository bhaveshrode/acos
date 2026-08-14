"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateHydrator = void 0;
const HydrationResult_js_1 = require("./HydrationResult.js");
/**
 * StateHydrator loading snapshots values from persistence and returning a HydrationResult.
 */
class StateHydrator {
    persistence;
    constructor(persistence) {
        this.persistence = persistence;
    }
    hydrate(key, store) {
        try {
            const snapshot = this.persistence.load(key);
            if (snapshot) {
                store.update((state) => {
                    Object.assign(state, snapshot.data);
                });
                return HydrationResult_js_1.HydrationResult.success();
            }
            return HydrationResult_js_1.HydrationResult.failed("No snapshot found in storage");
        }
        catch (err) {
            return HydrationResult_js_1.HydrationResult.failed(err.message || "Deserialization failure");
        }
    }
}
exports.StateHydrator = StateHydrator;
