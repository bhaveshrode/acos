/**
 * DataDiscovery locating personal database paths matching user identifiers.
 */
export class DataDiscovery {
    discoverPersonalData(userId, records) {
        return records
            .filter((r) => r.userId === userId)
            .map((r) => `records/${r.id}`);
    }
}
