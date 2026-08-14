import { Profiler } from "./Profiler.js";

/**
 * DiagnosticsFactory building memory leak profilers.
 */
export class DiagnosticsFactory {
  public static createProfiler(): Profiler {
    return new Profiler();
  }

  public createProfiler(): Profiler {
    return DiagnosticsFactory.createProfiler();
  }
}
