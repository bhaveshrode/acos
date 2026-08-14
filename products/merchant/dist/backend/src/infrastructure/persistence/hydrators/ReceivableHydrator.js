"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceivableHydrator = void 0;
const AccountsReceivable_js_1 = require("../../../business/accounts_receivable/aggregates/AccountsReceivable.js");
const ReceivableAccountId_js_1 = require("../../../business/accounts_receivable/value-objects/ReceivableAccountId.js");
const ReceivableDeserializer_js_1 = require("../deserializers/ReceivableDeserializer.js");
/**
 * Reconstructs the complete AccountsReceivable aggregate root from historical snapshot state.
 */
class ReceivableHydrator {
    static hydrate(snapshot) {
        const props = ReceivableDeserializer_js_1.ReceivableDeserializer.deserialize(snapshot);
        const id = new ReceivableAccountId_js_1.ReceivableAccountId(snapshot.id);
        return new AccountsReceivable_js_1.AccountsReceivable(id, props);
    }
}
exports.ReceivableHydrator = ReceivableHydrator;
