"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancer = void 0;
/**
 * LoadBalancer choosing downstream hosts in round-robin turns.
 */
class LoadBalancer {
    index = 0;
    selectTarget(targets) {
        if (targets.length === 0)
            throw new Error("No load balancer targets");
        const target = targets[this.index % targets.length];
        this.index++;
        return target;
    }
}
exports.LoadBalancer = LoadBalancer;
