# ACOS System Architecture

ACOS follows a strict Domain-Driven Design (DDD) model layered within a clean architecture boundary:

1. **Presentation Layer**: HTTP Controllers, REST Routes, WebSocket connections, JSON serializers.
2. **Application Layer**: Mediator dispatcher running CQRS commands and queries, security claims checking, and transactional bounds.
3. **Domain Layer**: The heart of the platform containing Aggregate Roots, Entities, Value Objects, and Domain events.
4. **Infrastructure Layer**: DB persistence (Prisma / pg client), storage managers, blockchain confirmation trackers, and external gateways.
