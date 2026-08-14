"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentContext = void 0;
/**
 * DeploymentContext carrying target environment and version metadata snapshot.
 */
class DeploymentContext {
    env;
    version;
    startTime;
    constructor(env, version, startTime = Date.now()) {
        this.env = env;
        this.version = version;
        this.startTime = startTime;
        Object.freeze(this);
    }
}
exports.DeploymentContext = DeploymentContext;
