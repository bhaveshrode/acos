"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationState = void 0;
/**
 * NotificationState enum capturing lifecycle transitions.
 */
var NotificationState;
(function (NotificationState) {
    NotificationState["Queued"] = "Queued";
    NotificationState["Displaying"] = "Displaying";
    NotificationState["Displayed"] = "Displayed";
    NotificationState["Dismissed"] = "Dismissed";
    NotificationState["Expired"] = "Expired";
})(NotificationState || (exports.NotificationState = NotificationState = {}));
