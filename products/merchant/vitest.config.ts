import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    sequence: {
      // The PostgreSQL-backed specs (db on port 9005, recovery on port 9006)
      // share one database and one OutboxEvent table. Parallel workers can
      // claim each other's event rows and deliver them to their own in-process
      // bus, so a cache invalidation in one spec is silently lost in the other.
      // Running files one at a time keeps outbox delivery deterministic.
      fileParallelism: false
    }
  }
});
