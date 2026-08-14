"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventDispatcher = void 0;
/**
 * EventDispatcher invoking targeted callback triggers.
 */
class EventDispatcher {
    async dispatch(callback, eventData) {
        try {
            await callback(eventData);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.EventDispatcher = EventDispatcher;
