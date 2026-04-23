// ─────────────────────────────────────────────────────────────────────────────
// Payments Service
//
// Calls the backend to create Stripe checkout sessions.
// ─────────────────────────────────────────────────────────────────────────────

import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const API_BASE = Platform.select({
  web: 'http://localhost:8000',
  ios: 'http://localhost:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

type CheckoutParams = {
  amountCents: number;
  description: string;
  listingId: string;
  buyerEmail: string;
};

export async function createCheckoutSession(params: CheckoutParams): Promise<string> {
  const appUrl = Linking.createURL('/');

  const res = await fetch(`${API_BASE}/payments/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount_cents: params.amountCents,
      currency: 'usd',
      description: params.description,
      success_url: `${appUrl}payment-success`,
      cancel_url: `${appUrl}payment-cancel`,
      metadata: {
        listing_id: params.listingId,
        buyer_email: params.buyerEmail,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Payment request failed' }));
    throw new Error(err.detail || 'Payment request failed');
  }

  const data = await res.json();
  return data.url;
}

export async function openCheckout(params: CheckoutParams): Promise<void> {
  const url = await createCheckoutSession(params);
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    await WebBrowser.openBrowserAsync(url);
  }
}
