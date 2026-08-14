/**
 * Utility containing helper methods to manipulate generic JSON/data object structures.
 */
export class ObjectUtils {
    /**
     * Recursively freezes an object tree structure to prevent mutations.
     * @param obj The target object to freeze.
     */
    static deepFreeze(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (Object.isFrozen(obj)) {
            return obj;
        }
        Object.freeze(obj);
        Object.keys(obj).forEach((key) => {
            ObjectUtils.deepFreeze(obj[key]);
        });
        return obj;
    }
    /**
     * Performs a deep clone copy of a JSON-serializable object structure.
     * @param obj The target object to clone.
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => ObjectUtils.deepClone(item));
        }
        const cloned = {};
        Object.keys(obj).forEach((key) => {
            cloned[key] = ObjectUtils.deepClone(obj[key]);
        });
        return cloned;
    }
    /**
     * Performs a deep merge of target with source, returning a new merged object copy.
     */
    static deepMerge(target, source) {
        if (target === null || target === undefined)
            return ObjectUtils.deepClone(source);
        if (source === null || source === undefined)
            return ObjectUtils.deepClone(target);
        if (typeof target !== "object" || typeof source !== "object" || Array.isArray(target) || Array.isArray(source)) {
            return ObjectUtils.deepClone(source);
        }
        const merged = ObjectUtils.deepClone(target);
        Object.keys(source).forEach((key) => {
            if (typeof source[key] === "object" && source[key] !== null) {
                if (typeof merged[key] === "object" && merged[key] !== null) {
                    merged[key] = ObjectUtils.deepMerge(merged[key], source[key]);
                }
                else {
                    merged[key] = ObjectUtils.deepClone(source[key]);
                }
            }
            else {
                merged[key] = source[key];
            }
        });
        return merged;
    }
    /**
     * Returns a new object containing only the specified keys from the target.
     */
    static pick(obj, keys) {
        const result = {};
        keys.forEach((key) => {
            if (key in obj) {
                result[key] = obj[key];
            }
        });
        return result;
    }
    /**
     * Returns a new object omitting the specified keys from the target.
     */
    static omit(obj, keys) {
        const result = { ...obj };
        keys.forEach((key) => {
            delete result[key];
        });
        return result;
    }
}
