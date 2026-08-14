"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventParser = void 0;
/**
 * EventParser deserializing raw string bodies.
 */
class EventParser {
    parse(payload) {
        return JSON.parse(payload);
    }
}
exports.EventParser = EventParser;
