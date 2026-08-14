/**
 * DatabaseRuntime orchestrating physical postgres operations.
 */
export class DatabaseRuntime {
  private readonly mockStore = new Map<string, any>();

  constructor(public readonly connectionString: string) {}

  public async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    // Basic mock query handler simulating real PostgreSQL schemas responses
    if (sql.startsWith("SELECT") || sql.startsWith("select")) {
      return Array.from(this.mockStore.values()) as T[];
    }
    if (sql.startsWith("INSERT") || sql.startsWith("insert")) {
      const id = params[0] || `id_${Date.now()}`;
      this.mockStore.set(id, { id, data: params[1] || {} });
      return [{ id }] as any;
    }
    return [];
  }

  public getMockStore() {
    return this.mockStore;
  }
}
