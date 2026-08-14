/**
 * DataDiscovery locating personal database paths matching user identifiers.
 */
export class DataDiscovery {
  public discoverPersonalData(
    userId: string,
    records: Array<{ id: string; userId: string; [key: string]: any }>
  ): string[] {
    return records
      .filter((r) => r.userId === userId)
      .map((r) => `records/${r.id}`);
  }
}
