"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationEvent = void 0;
/**
 * ValidationEvent containing details of validation runs.
 */
class ValidationEvent {
    targetId;
    type;
    timestamp;
    errorsCount;
    constructor(targetId, type, timestamp = Date.now(), errorsCount = 0) {
        this.targetId = targetId;
        this.type = type;
        this.timestamp = timestamp;
        this.errorsCount = errorsCount;
        Object.freeze(this);
    }
}
exports.ValidationEvent = ValidationEvent;
