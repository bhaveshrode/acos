"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionalRenderer = void 0;
const PermissionResolver_js_1 = require("../authentication/PermissionResolver.js");
/**
 * ConditionalRenderer deciding whether components are rendered according to features and permissions checks.
 */
class ConditionalRenderer {
    checkFeatureFlag;
    constructor(checkFeatureFlag = () => true) {
        this.checkFeatureFlag = checkFeatureFlag;
    }
    shouldRender(metadata, user) {
        if (metadata.featureFlags) {
            for (const flag of metadata.featureFlags) {
                if (!this.checkFeatureFlag(flag))
                    return false;
            }
        }
        if (metadata.permissions && metadata.permissions.length > 0) {
            if (!user)
                return false;
            for (const permission of metadata.permissions) {
                if (!PermissionResolver_js_1.PermissionResolver.hasPermission(user, permission)) {
                    return false;
                }
            }
        }
        return true;
    }
}
exports.ConditionalRenderer = ConditionalRenderer;
