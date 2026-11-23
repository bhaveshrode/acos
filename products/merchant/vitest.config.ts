import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The PostgreSQL-backed specs (db on port 9005, recovery on port 9006)
    // share one database and one OutboxEvent table. Parallel workers can
    // claim each other's event rows and deliver them to their own in-process
    // bus, so a cache invalidation in one spec is silently lost in the other,
    // and the broker spec's row can be marked processed by another spec's
    // in-process bus without ever reaching the stream. Vitest only reads
    // fileParallelism at the top level of `test`; nesting it under `sequence`
    // is ignored. Running files one at a time keeps outbox delivery
    // deterministic.
    fileParallelism: false
  }
});
