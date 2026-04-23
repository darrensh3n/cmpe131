// ─────────────────────────────────────────────────────────────────────────────
// Payments Service (Mock)
//
// Simulates a payment flow for demo purposes. No backend or Stripe needed.
// ─────────────────────────────────────────────────────────────────────────────

export type CheckoutParams = {
  amountCents: number;
  description: string;
  listingId: string;
  buyerEmail: string;
};

/** Simulate network latency then resolve successfully. */
export async function processPayment(_params: CheckoutParams): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
