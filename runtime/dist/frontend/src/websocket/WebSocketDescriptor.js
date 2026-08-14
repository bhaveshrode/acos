"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketDescriptor = void 0;
/**
 * WebSocketDescriptor encapsulating connection descriptors and channel profiles.
 */
class WebSocketDescriptor {
    metadata;
    clientClass;
    supportedChannels;
    constructor(metadata, clientClass, supportedChannels = []) {
        this.metadata = metadata;
        this.clientClass = clientClass;
        this.supportedChannels = supportedChannels;
        Object.freeze(this.supportedChannels);
        Object.freeze(this);
    }
}
exports.WebSocketDescriptor = WebSocketDescriptor;
