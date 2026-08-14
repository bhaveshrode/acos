/**
 * ConflictResolver resolving differences using local or remote preferences.
 */
export class ConflictResolver {
  public resolve<T>(
    local: T,
    remote: T,
    strategy: "KeepLocal" | "KeepRemote" = "KeepLocal"
  ): T {
    return strategy === "KeepLocal" ? local : remote;
  }
}
