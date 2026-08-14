"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentComposer = void 0;
/**
 * ComponentComposer replacing placeholders tags with specific components contents.
 */
class ComponentComposer {
    compose(layout, slotBindings) {
        let layoutHtml = layout.render();
        for (const [slotName, slotContent] of Object.entries(slotBindings)) {
            const placeholder = `<!-- slot:${slotName} -->`;
            layoutHtml = layoutHtml.replace(placeholder, slotContent);
        }
        return layoutHtml;
    }
}
exports.ComponentComposer = ComponentComposer;
