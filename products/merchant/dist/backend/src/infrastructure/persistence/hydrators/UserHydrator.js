"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserHydrator = void 0;
const User_js_1 = require("../../../business/identity/aggregates/User.js");
const UserId_js_1 = require("../../../business/identity/value-objects/UserId.js");
const UserDeserializer_js_1 = require("../deserializers/UserDeserializer.js");
/**
 * Reconstructs the complete User aggregate root from historical snapshot state.
 */
class UserHydrator {
    static hydrate(snapshot) {
        const props = UserDeserializer_js_1.UserDeserializer.deserialize(snapshot);
        const id = new UserId_js_1.UserId(snapshot.id);
        return new User_js_1.User(id, props);
    }
}
exports.UserHydrator = UserHydrator;
