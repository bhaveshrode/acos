"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageState = void 0;
/**
 * PageState enum capturing structural page lifecycles.
 */
var PageState;
(function (PageState) {
    PageState["Initializing"] = "Initializing";
    PageState["Loading"] = "Loading";
    PageState["Ready"] = "Ready";
    PageState["Refreshing"] = "Refreshing";
    PageState["Error"] = "Error";
    PageState["Destroyed"] = "Destroyed";
})(PageState || (exports.PageState = PageState = {}));
