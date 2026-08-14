/**
 * Enum representing the operational state of an Invoice.
 */
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "DRAFT";
    InvoiceStatus["ISSUED"] = "ISSUED";
    InvoiceStatus["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatus["PAID"] = "PAID";
    InvoiceStatus["OVERPAID"] = "OVERPAID";
    InvoiceStatus["VOID"] = "VOID";
    InvoiceStatus["CANCELLED"] = "CANCELLED";
    InvoiceStatus["CLOSED"] = "CLOSED";
})(InvoiceStatus || (InvoiceStatus = {}));
