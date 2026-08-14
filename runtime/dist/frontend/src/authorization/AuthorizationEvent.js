"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationEvent = void 0;
/**
 * AuthorizationEvent carrying timestamps and incident metadata.
 */
class AuthorizationEvent {
    type;
    timestamp;
    metadata;
    constructor(type, timestamp = Date.now(), metadata) {
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.AuthorizationEvent = AuthorizationEvent;
