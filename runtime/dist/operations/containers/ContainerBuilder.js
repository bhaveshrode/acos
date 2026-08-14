"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContainerBuilder = void 0;
const ContainerDescriptor_js_1 = require("./ContainerDescriptor.js");
const ContainerImage_js_1 = require("./ContainerImage.js");
const ContainerInstance_js_1 = require("./ContainerInstance.js");
const ContainerState_js_1 = require("./ContainerState.js");
/**
 * ContainerBuilder building images and instance descriptors.
 */
class ContainerBuilder {
    build(id, imageName, tag) {
        const image = new ContainerImage_js_1.ContainerImage(imageName, tag);
        const instance = new ContainerInstance_js_1.ContainerInstance(`${id}-inst`, ContainerState_js_1.ContainerState.Stopped);
        return new ContainerDescriptor_js_1.ContainerDescriptor(id, image, instance);
    }
}
exports.ContainerBuilder = ContainerBuilder;
