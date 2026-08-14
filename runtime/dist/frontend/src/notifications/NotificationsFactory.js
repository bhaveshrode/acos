"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsFactory = void 0;
const NotificationRegistry_js_1 = require("./NotificationRegistry.js");
const NotificationResolver_js_1 = require("./NotificationResolver.js");
const NotificationQueue_js_1 = require("./NotificationQueue.js");
const NotificationDispatcher_js_1 = require("./NotificationDispatcher.js");
const NotificationScheduler_js_1 = require("./NotificationScheduler.js");
const NotificationManager_js_1 = require("./NotificationManager.js");
const NotificationRenderer_js_1 = require("./NotificationRenderer.js");
const NotificationContainer_js_1 = require("./NotificationContainer.js");
const NotificationStack_js_1 = require("./NotificationStack.js");
const NotificationAnimator_js_1 = require("./NotificationAnimator.js");
const NotificationEventDispatcher_js_1 = require("./NotificationEventDispatcher.js");
const NotificationObserver_js_1 = require("./NotificationObserver.js");
/**
 * NotificationsFactory implementing standard INotificationFactory composition roots.
 */
class NotificationsFactory {
    static createRegistry() {
        return new NotificationRegistry_js_1.NotificationRegistry();
    }
    static createResolver(registry) {
        return new NotificationResolver_js_1.NotificationResolver(registry);
    }
    static createQueue() {
        return new NotificationQueue_js_1.NotificationQueue();
    }
    static createDispatcher(queue) {
        return new NotificationDispatcher_js_1.NotificationDispatcher(queue);
    }
    static createScheduler(dispatcher) {
        return new NotificationScheduler_js_1.NotificationScheduler(dispatcher);
    }
    static createManager(queue) {
        return new NotificationManager_js_1.NotificationManager(queue);
    }
    static createRenderer() {
        return new NotificationRenderer_js_1.NotificationRenderer();
    }
    static createContainer() {
        return new NotificationContainer_js_1.NotificationContainer();
    }
    static createStack() {
        return new NotificationStack_js_1.NotificationStack();
    }
    static createAnimator() {
        return new NotificationAnimator_js_1.NotificationAnimator();
    }
    static createEventDispatcher() {
        return new NotificationEventDispatcher_js_1.NotificationEventDispatcher();
    }
    static createObserver(dispatcher) {
        return new NotificationObserver_js_1.NotificationObserver(dispatcher);
    }
    createRegistry() {
        return NotificationsFactory.createRegistry();
    }
    createResolver(registry) {
        return NotificationsFactory.createResolver(registry);
    }
    createQueue() {
        return NotificationsFactory.createQueue();
    }
    createDispatcher(queue) {
        return NotificationsFactory.createDispatcher(queue);
    }
    createScheduler(dispatcher) {
        return NotificationsFactory.createScheduler(dispatcher);
    }
    createManager(queue) {
        return NotificationsFactory.createManager(queue);
    }
    createRenderer() {
        return NotificationsFactory.createRenderer();
    }
    createContainer() {
        return NotificationsFactory.createContainer();
    }
    createStack() {
        return NotificationsFactory.createStack();
    }
    createAnimator() {
        return NotificationsFactory.createAnimator();
    }
    createEventDispatcher() {
        return NotificationsFactory.createEventDispatcher();
    }
    createObserver(dispatcher) {
        return NotificationsFactory.createObserver(dispatcher);
    }
}
exports.NotificationsFactory = NotificationsFactory;
