import { DocumentationFactory } from "./DocumentationFactory.js";
import { SDKFactory } from "./SDKFactory.js";
import { CLIFactory } from "./CLIFactory.js";
import { GeneratorFactory } from "./GeneratorFactory.js";
import { PlaygroundFactory } from "./PlaygroundFactory.js";

export class DeveloperComposition {
  constructor(
    public readonly documentation: DocumentationFactory = new DocumentationFactory(),
    public readonly sdk: SDKFactory = new SDKFactory(),
    public readonly cli: CLIFactory = new CLIFactory(),
    public readonly generator: GeneratorFactory = new GeneratorFactory(),
    public readonly playground: PlaygroundFactory = new PlaygroundFactory()
  ) {
    Object.freeze(this);
  }
}
