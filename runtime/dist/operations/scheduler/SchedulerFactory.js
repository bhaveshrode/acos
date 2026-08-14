"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerFactory = void 0;
const CronJob_js_1 = require("./CronJob.js");
const BackgroundJob_js_1 = require("./BackgroundJob.js");
const JobScheduler_js_1 = require("./JobScheduler.js");
/**
 * SchedulerFactory building cron jobs and scheduler hosts.
 */
class SchedulerFactory {
    static createCronJob(id, expression, task) {
        return new CronJob_js_1.CronJob(id, expression, task);
    }
    static createBackgroundJob(id, task) {
        return new BackgroundJob_js_1.BackgroundJob(id, task);
    }
    static createScheduler() {
        return new JobScheduler_js_1.JobScheduler();
    }
    createCronJob(id, expression, task) {
        return SchedulerFactory.createCronJob(id, expression, task);
    }
    createBackgroundJob(id, task) {
        return SchedulerFactory.createBackgroundJob(id, task);
    }
    createScheduler() {
        return SchedulerFactory.createScheduler();
    }
}
exports.SchedulerFactory = SchedulerFactory;
