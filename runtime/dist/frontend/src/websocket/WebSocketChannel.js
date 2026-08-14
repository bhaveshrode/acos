"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketChannel = void 0;
/**
 * WebSocketChannel grouping related messages.
 */
class WebSocketChannel {
    id;
    name;
    messages;
    constructor(id, name, messages = []) {
        this.id = id;
        this.name = name;
        this.messages = messages;
    }
}
exports.WebSocketChannel = WebSocketChannel;
