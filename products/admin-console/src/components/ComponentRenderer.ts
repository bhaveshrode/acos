import { IComponent } from "./IComponent.js";
import { RenderResult } from "./RenderResult.js";

/**
 * ComponentRenderer coordinating rendering runs of IComponent instances returning RenderResults.
 */
export class ComponentRenderer {
  public render(component: IComponent): RenderResult {
    const start = performance.now();
    const output = component.render();
    const duration = performance.now() - start;
    return new RenderResult(output, duration, {
      componentId: component.context.metadata.id
    });
  }
}
