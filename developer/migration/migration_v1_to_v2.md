# ACOS Migration Guide: v1 to v2

This document details breaking API changes introduced in v2:

## Breaking Changes
* **Invoice Schema**: `currency` is now required and validated to match ISO 4217 specifications.
* **Refund Schema**: `reason` parameter is added and recommended.
* **Timestamp Formatting**: All dates are strictly parsed in ISO 8601 UTC format.
