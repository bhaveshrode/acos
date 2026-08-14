"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketState = void 0;
/**
 * WebSocketState enum capturing real-time connection lifecycles.
 */
var WebSocketState;
(function (WebSocketState) {
    WebSocketState["Disconnected"] = "Disconnected";
    WebSocketState["Connecting"] = "Connecting";
    WebSocketState["Connected"] = "Connected";
    WebSocketState["Reconnecting"] = "Reconnecting";
    WebSocketState["Closing"] = "Closing";
    WebSocketState["Closed"] = "Closed";
})(WebSocketState || (exports.WebSocketState = WebSocketState = {}));
