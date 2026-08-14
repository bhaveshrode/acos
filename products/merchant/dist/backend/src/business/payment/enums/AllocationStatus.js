/**
 * Enum representing status of a payment allocation to an invoice.
 */
export var AllocationStatus;
(function (AllocationStatus) {
    AllocationStatus["PENDING"] = "PENDING";
    AllocationStatus["ALLOCATED"] = "ALLOCATED";
    AllocationStatus["RELEASED"] = "RELEASED";
})(AllocationStatus || (AllocationStatus = {}));
