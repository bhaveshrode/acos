"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncState = void 0;
/**
 * SyncState enum capturing pipeline synchronization.
 */
var SyncState;
(function (SyncState) {
    SyncState["Idle"] = "Idle";
    SyncState["Synchronizing"] = "Synchronizing";
    SyncState["Completed"] = "Completed";
    SyncState["Failed"] = "Failed";
})(SyncState || (exports.SyncState = SyncState = {}));
