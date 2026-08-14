"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageDispatcher = void 0;
/**
 * MessageDispatcher delivering outgoing messages.
 */
class MessageDispatcher {
    client;
    constructor(client) {
        this.client = client;
    }
    dispatch(message) {
        this.client.send(message);
    }
}
exports.MessageDispatcher = MessageDispatcher;
