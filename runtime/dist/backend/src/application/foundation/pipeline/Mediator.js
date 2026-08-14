/**
 * Reusable Mediator coordinating handler resolution and pipeline behavior middleware chains.
 */
export class Mediator {
    handlers = new Map();
    behaviors = [];
    /**
     * Registers a use-case command or query request handler.
     */
    registerHandler(requestType, handler) {
        this.handlers.set(requestType.name, handler);
    }
    /**
     * Appends an interceptor middleware behavior to the execution chain.
     */
    addBehavior(behavior) {
        this.behaviors.push(behavior);
    }
    /**
     * Dispatches the request through registered behaviors and resolved handler.
     */
    async send(request) {
        const requestName = request.constructor.name;
        const handler = this.handlers.get(requestName);
        if (!handler) {
            throw new Error(`Handler not registered for request type: ${requestName}`);
        }
        let index = 0;
        const next = async () => {
            if (index < this.behaviors.length) {
                const behavior = this.behaviors[index++];
                // Call next recursively to process subsequent decorators
                return behavior.handle(request, next);
            }
            return handler.handle(request);
        };
        return next();
    }
}
