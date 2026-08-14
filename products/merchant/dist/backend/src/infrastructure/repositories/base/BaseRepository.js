"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const TransactionScope_js_1 = require("../../transactions/scopes/TransactionScope.js");
/**
 * Base Repository class holding the active query context.
 */
class BaseRepository {
    context;
    constructor(context) {
        this.context = context;
    }
    /**
     * Retrieves the active database client or transaction instance.
     * Prioritizes the ambient TransactionScope client if one is currently active.
     */
    get prisma() {
        return TransactionScope_js_1.TransactionScope.current ?? this.context.client;
    }
}
exports.BaseRepository = BaseRepository;
