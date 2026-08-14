import { CpuMonitor } from "./CpuMonitor.js";
import { MemoryMonitor } from "./MemoryMonitor.js";
import { DiskMonitor } from "./DiskMonitor.js";
import { ProcessMonitor } from "./ProcessMonitor.js";
import { MonitorRegistry } from "./MonitorRegistry.js";

/**
 * MonitoringFactory building resource monitors and registry helpers.
 */
export class MonitoringFactory {
  public static createCpuMonitor(): CpuMonitor {
    return new CpuMonitor();
  }

  public static createMemoryMonitor(): MemoryMonitor {
    return new MemoryMonitor();
  }

  public static createDiskMonitor(): DiskMonitor {
    return new DiskMonitor();
  }

  public static createProcessMonitor(): ProcessMonitor {
    return new ProcessMonitor();
  }

  public static createRegistry(): MonitorRegistry {
    return new MonitorRegistry();
  }

  public createCpuMonitor(): CpuMonitor {
    return MonitoringFactory.createCpuMonitor();
  }

  public createMemoryMonitor(): MemoryMonitor {
    return MonitoringFactory.createMemoryMonitor();
  }

  public createDiskMonitor(): DiskMonitor {
    return MonitoringFactory.createDiskMonitor();
  }

  public createProcessMonitor(): ProcessMonitor {
    return MonitoringFactory.createProcessMonitor();
  }

  public createRegistry(): MonitorRegistry {
    return MonitoringFactory.createRegistry();
  }
}
