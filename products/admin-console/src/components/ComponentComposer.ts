import { BaseComponent } from "./BaseComponent.js";

/**
 * ComponentComposer replacing placeholders tags with specific components contents.
 */
export class ComponentComposer {
  public compose(layout: BaseComponent, slotBindings: Record<string, string>): string {
    let layoutHtml = layout.render();
    for (const [slotName, slotContent] of Object.entries(slotBindings)) {
      const placeholder = `<!-- slot:${slotName} -->`;
      layoutHtml = layoutHtml.replace(placeholder, slotContent);
    }
    return layoutHtml;
  }
}
