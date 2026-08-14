/**
 * Enum representing states of a requested refund.
 */
export var RefundStatus;
(function (RefundStatus) {
    RefundStatus["REQUESTED"] = "REQUESTED";
    RefundStatus["APPROVED"] = "APPROVED";
    RefundStatus["REJECTED"] = "REJECTED";
    RefundStatus["COMPLETED"] = "COMPLETED";
})(RefundStatus || (RefundStatus = {}));
