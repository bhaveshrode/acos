import { CronJob } from "./CronJob.js";

/**
 * JobScheduler scheduling cron-jobs on timelines.
 */
export class JobScheduler {
  private readonly jobs = new Map<string, CronJob>();

  public schedule(job: CronJob): void {
    this.jobs.set(job.id, job);
  }

  public getJob(id: string): CronJob | undefined {
    return this.jobs.get(id);
  }
}
