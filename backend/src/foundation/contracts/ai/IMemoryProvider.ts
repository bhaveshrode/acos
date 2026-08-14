import { Result } from "../../result/Result.js";

/**
 * Interface representing semantic context storage capabilities for AI execution memory.
 */
export interface IMemoryProvider {
  /**
   * Records context facts or logs.
   */
  remember(key: string, value: string, metadata?: Record<string, any>): Promise<Result<void>>;

  /**
   * Retrieves recorded semantic memories matching the query request.
   */
  recall(query: string, limit?: number): Promise<Result<string[]>>;

  /**
   * Deletes a recorded memory path.
   */
  forget(key: string): Promise<Result<void>>;
}
