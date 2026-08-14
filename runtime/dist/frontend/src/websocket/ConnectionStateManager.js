"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionStateManager = void 0;
/**
 * ConnectionStateManager transitioning connection states.
 */
class ConnectionStateManager {
    transitionTo(client, nextState) {
        client.state = nextState;
    }
}
exports.ConnectionStateManager = ConnectionStateManager;
