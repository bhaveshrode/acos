/**
 * IProvider contract interface for dynamic registrations initializations.
 */
export interface IProvider {
  name: string;
  init(context: any): Promise<void>;
}
