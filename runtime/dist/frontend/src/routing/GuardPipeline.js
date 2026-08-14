"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardPipeline = void 0;
const GuardResult_js_1 = require("./GuardResult.js");
/**
 * GuardPipeline sequentially executing registered guards, returning a composite GuardResult.
 */
class GuardPipeline {
    async execute(guards, context) {
        for (const guard of guards) {
            const result = await guard.canActivate(context);
            if (!result.allowed) {
                return result;
            }
        }
        return GuardResult_js_1.GuardResult.allow();
    }
}
exports.GuardPipeline = GuardPipeline;
