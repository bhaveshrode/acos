export const resolvers = {
  Query: {
    getInvoice: (parent: any, args: { id: string }) => ({
      id: args.id,
      organizationId: "org_99",
      customerId: "cust_77",
      invoiceNumber: "INV-GQL-123",
      currency: "USD",
      grandTotal: 1500.0,
      status: "ISSUED"
    }),
    getRefund: (parent: any, args: { id: string }) => ({
      id: args.id,
      paymentId: "pay_55",
      amount: 250.0,
      status: "COMPLETED"
    })
  },
  Mutation: {
    createInvoice: (parent: any, args: {
      organizationId: string;
      customerId: string;
      invoiceNumber: string;
      currency: string;
      grandTotal: number;
    }) => ({
      id: `inv_gql_${Math.floor(Math.random() * 1000)}`,
      organizationId: args.organizationId,
      customerId: args.customerId,
      invoiceNumber: args.invoiceNumber,
      currency: args.currency,
      grandTotal: args.grandTotal,
      status: "DRAFT"
    }),
    refundPayment: (parent: any, args: { paymentId: string; amount: number }) => ({
      id: `ref_gql_${Math.floor(Math.random() * 1000)}`,
      paymentId: args.paymentId,
      amount: args.amount,
      status: "PENDING"
    })
  }
};
