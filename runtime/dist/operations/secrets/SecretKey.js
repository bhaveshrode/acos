"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretKey = void 0;
/**
 * SecretKey wrapping vault item IDs and values.
 */
class SecretKey {
    id;
    value;
    version;
    constructor(id, value, version = "1") {
        this.id = id;
        this.value = value;
        this.version = version;
        Object.freeze(this);
    }
}
exports.SecretKey = SecretKey;
