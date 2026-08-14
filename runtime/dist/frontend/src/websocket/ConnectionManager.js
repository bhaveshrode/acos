"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManager = void 0;
/**
 * ConnectionManager coordinating connection and disconnection states.
 */
class ConnectionManager {
    client;
    constructor(client) {
        this.client = client;
    }
    connect() {
        this.client.connect();
    }
    disconnect() {
        this.client.disconnect();
    }
}
exports.ConnectionManager = ConnectionManager;
