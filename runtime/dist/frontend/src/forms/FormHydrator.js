"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormHydrator = void 0;
/**
 * FormHydrator restoring form drafts payloads back to active inputs.
 */
class FormHydrator {
    serializer;
    draftManager;
    constructor(serializer, draftManager) {
        this.serializer = serializer;
        this.draftManager = draftManager;
    }
    hydrate(form) {
        const draft = this.draftManager.getDraft(form.context.metadata.id);
        if (!draft)
            return false;
        try {
            const data = this.serializer.deserialize(draft);
            for (const [key, val] of Object.entries(data.values)) {
                form.setFieldValue(key, val);
            }
            form.state = data.state;
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.FormHydrator = FormHydrator;
