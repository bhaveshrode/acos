import { ContextBuilder } from "../context/ContextBuilder.js";
export class ContextFactory {
    createContextBuilder() {
        return new ContextBuilder();
    }
}
