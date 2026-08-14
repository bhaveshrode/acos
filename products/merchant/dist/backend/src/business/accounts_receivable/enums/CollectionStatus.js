/**
 * Enum representing steps in the collections lifecycle.
 */
export var CollectionStatus;
(function (CollectionStatus) {
    CollectionStatus["NONE"] = "NONE";
    CollectionStatus["REMINDER_SENT"] = "REMINDER_SENT";
    CollectionStatus["ESCALATED"] = "ESCALATED";
    CollectionStatus["LEGAL_REVIEW"] = "LEGAL_REVIEW";
    CollectionStatus["RESOLVED"] = "RESOLVED";
})(CollectionStatus || (CollectionStatus = {}));
