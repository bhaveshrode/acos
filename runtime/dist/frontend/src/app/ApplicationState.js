"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationState = exports.InitState = void 0;
/**
 * InitState representing lifecycle transitions.
 */
var InitState;
(function (InitState) {
    InitState["Uninitialized"] = "Uninitialized";
    InitState["Initializing"] = "Initializing";
    InitState["Ready"] = "Ready";
    InitState["Shutdown"] = "Shutdown";
})(InitState || (exports.InitState = InitState = {}));
/**
 * ApplicationState monitoring initialization, ready, and shutdown states.
 */
class ApplicationState {
    state = InitState.Uninitialized;
    transitionTo(nextState) {
        this.state = nextState;
    }
    get() {
        return this.state;
    }
}
exports.ApplicationState = ApplicationState;
