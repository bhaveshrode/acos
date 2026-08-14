/**
 * Immutable snapshot representing the compiled context for a reasoning process.
 */
export class IntelligenceContext {
    props;
    constructor(props) {
        this.props = props;
        const deepFreeze = (obj) => {
            if (obj && typeof obj === "object") {
                Object.freeze(obj);
                Object.keys(obj).forEach((key) => {
                    deepFreeze(obj[key]);
                });
            }
            return obj;
        };
        deepFreeze(this.props);
        Object.freeze(this);
    }
}
