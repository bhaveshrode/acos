/**
 * ICrmProvider interface declaring contact and opportunity sync hooks.
 */
export interface ICrmProvider {
  syncContact(
    contactId: string,
    details: Record<string, any>
  ): Promise<string>;
  syncOpportunity(
    oppId: string,
    details: Record<string, any>
  ): Promise<string>;
}
