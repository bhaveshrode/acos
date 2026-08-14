/**
 * Enum representing the status of a customer's receivable account or entry.
 */
export var ReceivableStatus;
(function (ReceivableStatus) {
    ReceivableStatus["CURRENT"] = "CURRENT";
    ReceivableStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    ReceivableStatus["OVERDUE"] = "OVERDUE";
    ReceivableStatus["IN_COLLECTIONS"] = "IN_COLLECTIONS";
    ReceivableStatus["WRITTEN_OFF"] = "WRITTEN_OFF";
    ReceivableStatus["CLOSED"] = "CLOSED";
})(ReceivableStatus || (ReceivableStatus = {}));
