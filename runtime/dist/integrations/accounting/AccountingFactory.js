"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingFactory = void 0;
const QuickBooksAdapter_js_1 = require("./QuickBooksAdapter.js");
const XeroAdapter_js_1 = require("./XeroAdapter.js");
/**
 * AccountingFactory constructing accounting adapters.
 */
class AccountingFactory {
    static createQuickBooksAdapter() {
        return new QuickBooksAdapter_js_1.QuickBooksAdapter();
    }
    static createXeroAdapter() {
        return new XeroAdapter_js_1.XeroAdapter();
    }
    createQuickBooksAdapter() {
        return AccountingFactory.createQuickBooksAdapter();
    }
    createXeroAdapter() {
        return AccountingFactory.createXeroAdapter();
    }
}
exports.AccountingFactory = AccountingFactory;
