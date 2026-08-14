import { DocumentationOptions } from "./DocumentationOptions.js";
import { DocumentationGenerator } from "./DocumentationGenerator.js";
import { OpenApiBuilder } from "./OpenApiBuilder.js";
import { DocumentationController } from "./DocumentationController.js";
import { ControllerMetadataProvider } from "./ControllerMetadataProvider.js";
import { RouteMetadataProvider } from "./RouteMetadataProvider.js";
import { ModelMetadataProvider } from "./ModelMetadataProvider.js";
import { SecurityMetadataProvider } from "./SecurityMetadataProvider.js";
import { SchemaGenerator } from "./SchemaGenerator.js";
import { OperationBuilder } from "./OperationBuilder.js";

/**
 * DocumentationFactory assembling documentation generators, metadata providers, and OpenAPI builders.
 */
export class DocumentationFactory {
  public static createGenerator(options: DocumentationOptions): DocumentationGenerator {
    return new DocumentationGenerator(options);
  }

  public static createController(generator: DocumentationGenerator): DocumentationController {
    return new DocumentationController(generator, new OpenApiBuilder());
  }

  public static createControllerMetadataProvider(): ControllerMetadataProvider {
    return new ControllerMetadataProvider();
  }

  public static createRouteMetadataProvider(): RouteMetadataProvider {
    return new RouteMetadataProvider();
  }

  public static createModelMetadataProvider(): ModelMetadataProvider {
    return new ModelMetadataProvider();
  }

  public static createSecurityMetadataProvider(): SecurityMetadataProvider {
    return new SecurityMetadataProvider();
  }

  public static createSchemaGenerator(): SchemaGenerator {
    return new SchemaGenerator();
  }

  public static createOperationBuilder(): OperationBuilder {
    return new OperationBuilder();
  }
}
