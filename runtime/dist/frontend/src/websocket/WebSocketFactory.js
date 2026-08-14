"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketFactory = void 0;
const WebSocketRegistry_js_1 = require("./WebSocketRegistry.js");
const WebSocketResolver_js_1 = require("./WebSocketResolver.js");
const WebSocketChannelRegistry_js_1 = require("./WebSocketChannelRegistry.js");
const MessageDispatcher_js_1 = require("./MessageDispatcher.js");
const MessageReceiver_js_1 = require("./MessageReceiver.js");
const ConnectionManager_js_1 = require("./ConnectionManager.js");
const SubscriptionManager_js_1 = require("./SubscriptionManager.js");
const HeartbeatManager_js_1 = require("./HeartbeatManager.js");
const MessageBuffer_js_1 = require("./MessageBuffer.js");
const ConnectionStateManager_js_1 = require("./ConnectionStateManager.js");
const ReconnectionPolicy_js_1 = require("./ReconnectionPolicy.js");
const SessionRecoveryManager_js_1 = require("./SessionRecoveryManager.js");
const MessageSynchronizer_js_1 = require("./MessageSynchronizer.js");
const WebSocketEventDispatcher_js_1 = require("./WebSocketEventDispatcher.js");
const WebSocketObserver_js_1 = require("./WebSocketObserver.js");
/**
 * WebSocketFactory implementing standard IWebSocketFactory composition roots.
 */
class WebSocketFactory {
    static createRegistry() {
        return new WebSocketRegistry_js_1.WebSocketRegistry();
    }
    static createResolver(registry) {
        return new WebSocketResolver_js_1.WebSocketResolver(registry);
    }
    static createChannelRegistry() {
        return new WebSocketChannelRegistry_js_1.WebSocketChannelRegistry();
    }
    static createDispatcher(client) {
        return new MessageDispatcher_js_1.MessageDispatcher(client);
    }
    static createReceiver() {
        return new MessageReceiver_js_1.MessageReceiver();
    }
    static createConnectionManager(client) {
        return new ConnectionManager_js_1.ConnectionManager(client);
    }
    static createSubscriptionManager() {
        return new SubscriptionManager_js_1.SubscriptionManager();
    }
    static createHeartbeatManager() {
        return new HeartbeatManager_js_1.HeartbeatManager();
    }
    static createMessageBuffer() {
        return new MessageBuffer_js_1.MessageBuffer();
    }
    static createConnectionStateManager() {
        return new ConnectionStateManager_js_1.ConnectionStateManager();
    }
    static createReconnectionPolicy() {
        return new ReconnectionPolicy_js_1.ReconnectionPolicy();
    }
    static createSessionRecoveryManager(subscriptionManager) {
        return new SessionRecoveryManager_js_1.SessionRecoveryManager(subscriptionManager);
    }
    static createMessageSynchronizer() {
        return new MessageSynchronizer_js_1.MessageSynchronizer();
    }
    static createLifecycleDispatcher() {
        return new WebSocketEventDispatcher_js_1.WebSocketEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new WebSocketObserver_js_1.WebSocketObserver(dispatcher);
    }
    createRegistry() {
        return WebSocketFactory.createRegistry();
    }
    createResolver(registry) {
        return WebSocketFactory.createResolver(registry);
    }
    createChannelRegistry() {
        return WebSocketFactory.createChannelRegistry();
    }
    createDispatcher(client) {
        return WebSocketFactory.createDispatcher(client);
    }
    createReceiver() {
        return WebSocketFactory.createReceiver();
    }
    createConnectionManager(client) {
        return WebSocketFactory.createConnectionManager(client);
    }
    createSubscriptionManager() {
        return WebSocketFactory.createSubscriptionManager();
    }
    createHeartbeatManager() {
        return WebSocketFactory.createHeartbeatManager();
    }
    createMessageBuffer() {
        return WebSocketFactory.createMessageBuffer();
    }
    createConnectionStateManager() {
        return WebSocketFactory.createConnectionStateManager();
    }
    createReconnectionPolicy() {
        return WebSocketFactory.createReconnectionPolicy();
    }
    createSessionRecoveryManager(subscriptionManager) {
        return WebSocketFactory.createSessionRecoveryManager(subscriptionManager);
    }
    createMessageSynchronizer() {
        return WebSocketFactory.createMessageSynchronizer();
    }
    createLifecycleDispatcher() {
        return WebSocketFactory.createLifecycleDispatcher();
    }
    createObserver(dispatcher) {
        return WebSocketFactory.createObserver(dispatcher);
    }
}
exports.WebSocketFactory = WebSocketFactory;
