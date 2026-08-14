/**
 * Enum representing the processing state of a Payment.
 */
export var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUBMITTED"] = "SUBMITTED";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["CONFIRMED"] = "CONFIRMED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (PaymentStatus = {}));
