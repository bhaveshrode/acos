/**
 * Base configuration exception.
 */
export class ConfigurationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationException";
  }
}

/**
 * Thrown when a required configuration key is missing.
 */
export class MissingConfigurationException extends ConfigurationException {
  constructor(key: string) {
    super(`Required configuration key '${key}' is missing.`);
    this.name = "MissingConfigurationException";
  }
}

/**
 * Thrown when an unsupported execution environment value is supplied.
 */
export class InvalidEnvironmentException extends ConfigurationException {
  constructor(env: string) {
    super(`Environment '${env}' is invalid or unsupported.`);
    this.name = "InvalidEnvironmentException";
  }
}

/**
 * Thrown when a secure token/key retrieval fails.
 */
export class SecretLoadException extends ConfigurationException {
  constructor(key: string, details: string) {
    super(`Failed to load secret '${key}': ${details}`);
    this.name = "SecretLoadException";
  }
}
