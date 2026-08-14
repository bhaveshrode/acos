import { CronJob } from "./CronJob.js";
import { BackgroundJob } from "./BackgroundJob.js";
import { JobScheduler } from "./JobScheduler.js";

/**
 * SchedulerFactory building cron jobs and scheduler hosts.
 */
export class SchedulerFactory {
  public static createCronJob(
    id: string,
    expression: string,
    task: () => void
  ): CronJob {
    return new CronJob(id, expression, task);
  }

  public static createBackgroundJob(
    id: string,
    task: () => Promise<void>
  ): BackgroundJob {
    return new BackgroundJob(id, task);
  }

  public static createScheduler(): JobScheduler {
    return new JobScheduler();
  }

  public createCronJob(
    id: string,
    expression: string,
    task: () => void
  ): CronJob {
    return SchedulerFactory.createCronJob(id, expression, task);
  }

  public createBackgroundJob(
    id: string,
    task: () => Promise<void>
  ): BackgroundJob {
    return SchedulerFactory.createBackgroundJob(id, task);
  }

  public createScheduler(): JobScheduler {
    return SchedulerFactory.createScheduler();
  }
}
