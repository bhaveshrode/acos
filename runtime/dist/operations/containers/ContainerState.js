"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerState = void 0;
/**
 * ContainerState enum capturing container execution status.
 */
var ContainerState;
(function (ContainerState) {
    ContainerState["Running"] = "Running";
    ContainerState["Stopped"] = "Stopped";
    ContainerState["Failed"] = "Failed";
})(ContainerState || (exports.ContainerState = ContainerState = {}));
