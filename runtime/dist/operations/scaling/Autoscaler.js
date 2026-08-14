"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Autoscaler = void 0;
const ScaleDirection_js_1 = require("./ScaleDirection.js");
/**
 * Autoscaler evaluating load signals.
 */
class Autoscaler {
    evaluate(cpuUsage) {
        if (cpuUsage > 80)
            return ScaleDirection_js_1.ScaleDirection.Up;
        if (cpuUsage < 20)
            return ScaleDirection_js_1.ScaleDirection.Down;
        return undefined;
    }
}
exports.Autoscaler = Autoscaler;
