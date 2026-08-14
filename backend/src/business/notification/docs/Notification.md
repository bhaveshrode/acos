# Notification Bounded Context

## Purpose
The Notification Bounded Context handles the template resolution, channel routing, delivery tracking, and retry management of communication payloads triggered by events throughout the ACOS network. It acts as an event-driven side-effect layer, decoupled from invoice calculations or payment processing.

## Ubiquitous Language

- **Notification**: A communication payload generated from a system event.
- **Recipient**: The targeted user, customer, or administrator.
- **Channel**: The medium of communication (e.g. Email, SMS, Webhook, Push, In-App).
- **Template**: Preconfigured layouts resolved with runtime event tags.
- **Delivery Attempt**: Logged attempt to dispatch the message through a provider gateway.
- **Retry**: Subsequent delivery attempts evaluated under backoff rules.
- **Read Receipt**: Logged acknowledgment of recipient views.

## Responsibilities
- Resolving templates based on event payload.
- Filtering recipient preferences.
- Governing multi-channel delivery attempts.
- Executing retry configurations and handling gateway responses.

## Dependencies
- OrganizationId
- UserId (audit or direct mapping)
