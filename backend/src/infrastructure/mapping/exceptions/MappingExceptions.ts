/**
 * Base mapping exception.
 */
export class MappingException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MappingException";
  }
}

/**
 * Thrown when attempting to resolve an unregistered mapper.
 */
export class UnknownMapperException extends MappingException {
  constructor(source: string, target: string) {
    super(`No registered mapper found to convert from '${source}' to '${target}'.`);
    this.name = "UnknownMapperException";
  }
}

/**
 * Thrown when mapper registries cannot configure correctly.
 */
export class MappingConfigurationException extends MappingException {
  constructor(details: string) {
    super(`Mapping configuration failed: ${details}`);
    this.name = "MappingConfigurationException";
  }
}
