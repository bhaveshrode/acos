"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobScheduler = void 0;
/**
 * JobScheduler scheduling cron-jobs on timelines.
 */
class JobScheduler {
    jobs = new Map();
    schedule(job) {
        this.jobs.set(job.id, job);
    }
    getJob(id) {
        return this.jobs.get(id);
    }
}
exports.JobScheduler = JobScheduler;
