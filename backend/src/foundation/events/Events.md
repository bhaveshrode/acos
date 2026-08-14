# Event Infrastructure Design Analysis

This document outlines the architecture, component separation, and guidelines for the Event-Driven infrastructure in the Autonomous Commerce OS (ACOS) Foundation Layer.

---

## 1. Single Responsibility Separation of Concerns

ACOS is built on Event-Driven Architecture (EDA). To prevent event structures from leaking execution concerns, the responsibility is divided into isolated components:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   DomainEvent   ├──────►│    EventBus     ├──────►│   Dispatcher    │
│  (Data Carrier) │       │ (Pub/Sub API)   │       │ (Executes Jobs) │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
                                                             ▼
                                                    ┌─────────────────┐
                                                    │  EventHandlers  │
                                                    │ (Business Jobs) │
                                                    └─────────────────┘
```

- **`IDomainEvent`**: An immutable class representing a fact that happened in the past. It carries *only* the state of what changed. It has no knowledge of how it is published or handled.
- **`EventMetadata`**: Wraps the event with system telemetry (timestamps, event ID, causation/correlation IDs, aggregate types) to support tracing.
- **`IEventBus`**: The core messaging contract. Allows modules to publish events and register subscribers.
- **`EventRegistry`**: Tracks which `IEventHandler` is subscribed to which event name.
- **`EventDispatcher`**: Orchestrates the synchronous or asynchronous execution of the registered handlers when an event is published.
- **`IEventHandler`**: Subscribing handlers that contain the side-effect logic (e.g. updating A/R, sending emails).

---

## 2. The Transaction-Event Publish Cycle

Domain events represent state changes. To prevent **Ghost Events** (where an event is dispatched but the database transaction subsequently rolls back), ACOS enforces the following publish cycle:

1. **Raise**: A business action on an aggregate calls `this.addDomainEvent(event)`, recording it in the aggregate's internal queue.
2. **Persist**: The Application Service saves the aggregate's state via its `Repository`.
3. **Extract**: The service (or Unit of Work middleware) reads the aggregate's queue: `const events = aggregate.domainEvents`.
4. **Publish**: The events are dispatched to the bus: `await eventBus.publish(events)`.
5. **Clear**: The aggregate's queue is flushed: `aggregate.clearDomainEvents()`.

---

## 3. Technology-Agnostic Contract

The interfaces defined in the Domain layer (`IEventBus`, `IEventHandler`) make no assumptions about the transport network. 
- In-process development uses an in-memory `EventBus` implementation.
- Moving to production requires only swap-binding the `IEventBus` interface to an Infrastructure implementation (e.g. KafkaEventBus, RabbitMQEventBus) without altering the domain code.
