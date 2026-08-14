/**
 * SubsystemLifecycle capturing lifecycle states.
 */
export var SubsystemLifecycle;
(function (SubsystemLifecycle) {
    SubsystemLifecycle["UNINITIALIZED"] = "UNINITIALIZED";
    SubsystemLifecycle["INITIALIZING"] = "INITIALIZING";
    SubsystemLifecycle["INITIALIZED"] = "INITIALIZED";
    SubsystemLifecycle["READY"] = "READY";
    SubsystemLifecycle["DRAINING"] = "DRAINING";
    SubsystemLifecycle["STOPPED"] = "STOPPED";
})(SubsystemLifecycle || (SubsystemLifecycle = {}));
