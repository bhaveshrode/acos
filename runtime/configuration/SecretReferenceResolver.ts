/**
 * SecretReferenceResolver resolving credentials references.
 */
export class SecretReferenceResolver {
  public resolveSecret(reference: string, mockSecretStore: Record<string, string>): string {
    if (reference.startsWith("vault://")) {
      const key = reference.replace("vault://", "");
      const val = mockSecretStore[key];
      if (!val) {
        throw new Error(`Vault secret key not found: ${key}`);
      }
      return val;
    }
    return reference; // Constant values pass through
  }
}
