"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsState = void 0;
/**
 * AnalyticsState enum capturing collection state lifecycles.
 */
var AnalyticsState;
(function (AnalyticsState) {
    AnalyticsState["Initializing"] = "Initializing";
    AnalyticsState["Collecting"] = "Collecting";
    AnalyticsState["Processing"] = "Processing";
    AnalyticsState["Ready"] = "Ready";
    AnalyticsState["Disabled"] = "Disabled";
})(AnalyticsState || (exports.AnalyticsState = AnalyticsState = {}));
