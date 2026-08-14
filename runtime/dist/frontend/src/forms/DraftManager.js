"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraftManager = void 0;
/**
 * DraftManager managing local form drafts storage.
 */
class DraftManager {
    serializer;
    constructor(serializer) {
        this.serializer = serializer;
    }
    saveDraft(form) {
        const serialized = this.serializer.serialize(form);
        localStorage.setItem(`acos:form_draft:${form.context.metadata.id}`, serialized);
    }
    getDraft(formId) {
        return localStorage.getItem(`acos:form_draft:${formId}`);
    }
    clearDraft(formId) {
        localStorage.removeItem(`acos:form_draft:${formId}`);
    }
}
exports.DraftManager = DraftManager;
