"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictResolver = void 0;
/**
 * ConflictResolver resolving differences using local or remote preferences.
 */
class ConflictResolver {
    resolve(local, remote, strategy = "KeepLocal") {
        return strategy === "KeepLocal" ? local : remote;
    }
}
exports.ConflictResolver = ConflictResolver;
