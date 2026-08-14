"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormStateManager = void 0;
/**
 * FormStateManager tracking form lifecycle transitions.
 */
class FormStateManager {
    transition(form, nextState) {
        form.state = nextState;
    }
}
exports.FormStateManager = FormStateManager;
