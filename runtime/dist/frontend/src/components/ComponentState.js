"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentState = void 0;
/**
 * ComponentState enum capturing components rendering lifecycle states.
 */
var ComponentState;
(function (ComponentState) {
    ComponentState["Created"] = "Created";
    ComponentState["Mounted"] = "Mounted";
    ComponentState["Updating"] = "Updating";
    ComponentState["Unmounted"] = "Unmounted";
})(ComponentState || (exports.ComponentState = ComponentState = {}));
