"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormState = void 0;
/**
 * FormState enum capturing form lifecycle states.
 */
var FormState;
(function (FormState) {
    FormState["Pristine"] = "Pristine";
    FormState["Dirty"] = "Dirty";
    FormState["Validating"] = "Validating";
    FormState["Valid"] = "Valid";
    FormState["Invalid"] = "Invalid";
    FormState["Submitting"] = "Submitting";
    FormState["Submitted"] = "Submitted";
})(FormState || (exports.FormState = FormState = {}));
