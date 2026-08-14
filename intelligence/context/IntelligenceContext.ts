export interface IntelligenceContextProps {
  eventId: string;
  correlationId: string;
  causationId: string;
  eventType: string;
  timestamp: Date;
  merchantId: string;
  customerId?: string;
  invoiceId?: string;
  paymentId?: string;
  relatedInvoices?: any[];
  relatedPayments?: any[];
  previousReminders?: any[];
  accountStatus?: string;
  authClaims?: Record<string, any>;
}

/**
 * Immutable snapshot representing the compiled context for a reasoning process.
 */
export class IntelligenceContext {
  constructor(public readonly props: IntelligenceContextProps) {
    const deepFreeze = (obj: any): any => {
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
