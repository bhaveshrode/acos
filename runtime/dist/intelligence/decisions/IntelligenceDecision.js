/**
 * Immutable decision value object representing reasoning outcomes.
 */
export class IntelligenceDecision {
    props;
    constructor(props) {
        this.props = props;
        Object.freeze(this.props);
        Object.freeze(this);
    }
}
