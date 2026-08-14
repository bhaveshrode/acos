"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LayoutState = void 0;
/**
 * LayoutState enum capturing structural rendering lifecycle states.
 */
var LayoutState;
(function (LayoutState) {
    LayoutState["Initializing"] = "Initializing";
    LayoutState["Rendering"] = "Rendering";
    LayoutState["Active"] = "Active";
    LayoutState["Destroyed"] = "Destroyed";
})(LayoutState || (exports.LayoutState = LayoutState = {}));
