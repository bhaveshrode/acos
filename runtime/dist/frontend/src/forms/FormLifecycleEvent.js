"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormLifecycleEvent = void 0;
/**
 * FormLifecycleEvent capturing detailed form state updates timestamps.
 */
class FormLifecycleEvent {
    formId;
    type;
    timestamp;
    metadata;
    constructor(formId, type, timestamp = Date.now(), metadata) {
        this.formId = formId;
        this.type = type;
        this.timestamp = timestamp;
        this.metadata = metadata;
        Object.freeze(this);
    }
}
exports.FormLifecycleEvent = FormLifecycleEvent;
