/**
 * Loads process.env configuration variables.
 * Translates double underscores (e.g. APP__NAME) into path dot notation (e.g. app.name).
 */
export class EnvironmentLoader {
  /**
   * Reads and normalizes all active environment variables.
   */
  public static load(): Record<string, string> {
    const envs: Record<string, string> = {};
    for (const key in process.env) {
      if (Object.prototype.hasOwnProperty.call(process.env, key)) {
        const normalizedKey = key.replace(/__/g, ".").toLowerCase();
        envs[normalizedKey] = process.env[key] || "";
      }
    }
    return envs;
  }
}
