/**
 * SecretReferenceResolver resolving credentials references.
 */
export class SecretReferenceResolver {
    resolveSecret(reference, mockSecretStore) {
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
