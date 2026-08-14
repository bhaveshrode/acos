"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseComponent = void 0;
const ComponentState_js_1 = require("./ComponentState.js");
/**
 * BaseComponent implementing IComponent contract.
 */
class BaseComponent {
    context;
    props;
    state = ComponentState_js_1.ComponentState.Created;
    children = new Set();
    constructor(context, props) {
        this.context = context;
        this.props = props;
    }
    mount(element) {
        this.state = ComponentState_js_1.ComponentState.Mounted;
        this.onMount(element);
    }
    update(nextProps) {
        this.state = ComponentState_js_1.ComponentState.Updating;
        this.onUpdate(nextProps);
        this.state = ComponentState_js_1.ComponentState.Mounted;
    }
    unmount() {
        this.state = ComponentState_js_1.ComponentState.Unmounted;
        this.onDestroy();
        for (const child of this.children) {
            child.unmount();
        }
        this.children.clear();
    }
    onMount(element) { }
    onUpdate(nextProps) { }
    onDestroy() { }
    addChild(child) {
        this.children.add(child);
    }
}
exports.BaseComponent = BaseComponent;
