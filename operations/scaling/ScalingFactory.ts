import { Autoscaler } from "./Autoscaler.js";
import { WorkerPool } from "./WorkerPool.js";

/**
 * ScalingFactory building autoscalers.
 */
export class ScalingFactory {
  public static createAutoscaler(): Autoscaler {
    return new Autoscaler();
  }

  public static createWorkerPool(): WorkerPool {
    return new WorkerPool();
  }

  public createAutoscaler(): Autoscaler {
    return ScalingFactory.createAutoscaler();
  }

  public createWorkerPool(): WorkerPool {
    return ScalingFactory.createWorkerPool();
  }
}
