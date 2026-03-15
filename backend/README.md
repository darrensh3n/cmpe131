# Spartan Marketplace API

FastAPI backend for Spartan Marketplace. The project is organized so Supabase (auth, database) can be added later without restructuring.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your Stripe keys (get test keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Developers → API keys).

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Stripe

- **Checkout**: `POST /payments/create-checkout-session` — body: `amount_cents`, `currency`, `success_url`, `cancel_url`, optional `description`, `metadata`. Returns `url` and `session_id` for redirecting the user to Stripe Checkout.
- **Webhook**: `POST /webhooks/stripe` — receives Stripe events. For local testing, use the [Stripe CLI](https://stripe.com/docs/stripe-cli): `stripe listen --forward-to localhost:8000/webhooks/stripe` and set `STRIPE_WEBHOOK_SECRET` to the signing secret it prints.
