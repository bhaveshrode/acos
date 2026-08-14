"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerInstance = void 0;
const ContainerState_js_1 = require("./ContainerState.js");
/**
 * ContainerInstance representing active running container instances.
 */
class ContainerInstance {
    instanceId;
    state;
    constructor(instanceId, state = ContainerState_js_1.ContainerState.Stopped) {
        this.instanceId = instanceId;
        this.state = state;
        Object.freeze(this);
    }
}
exports.ContainerInstance = ContainerInstance;
