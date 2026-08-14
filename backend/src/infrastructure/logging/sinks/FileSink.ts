import fs from "fs";
import path from "path";

/**
 * Diagnostic log sink target writing output records directly into local storage log files.
 */
export class FileSink {
  constructor(private readonly logFilePath: string) {
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Appends a log line to the file. Fails silently if storage is locked or full.
   */
  public write(formattedMessage: string): void {
    try {
      fs.appendFileSync(this.logFilePath, formattedMessage + "\n", "utf-8");
    } catch {
      // Fail-safe boundary
    }
  }
}
