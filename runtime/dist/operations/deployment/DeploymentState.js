"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentState = void 0;
/**
 * DeploymentState enum capturing pipeline execution lifecycles.
 */
var DeploymentState;
(function (DeploymentState) {
    DeploymentState["Pending"] = "Pending";
    DeploymentState["Executing"] = "Executing";
    DeploymentState["Success"] = "Success";
    DeploymentState["Failed"] = "Failed";
})(DeploymentState || (exports.DeploymentState = DeploymentState = {}));
