import stripe
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from config import settings
from services import payments_service

router = APIRouter(prefix="/payments", tags=["payments"])

webhook_router = APIRouter(tags=["webhooks"])


class CreateCheckoutSessionRequest(BaseModel):
    amount_cents: int = Field(..., gt=0, description="Amount in cents")
    currency: str = Field(default="usd", min_length=3, max_length=3)
    success_url: str = Field(..., min_length=1)
    cancel_url: str = Field(..., min_length=1)
    description: str | None = None
    metadata: dict[str, str] | None = None


@router.post("/create-checkout-session")
def create_checkout_session(body: CreateCheckoutSessionRequest):
    try:
        session = payments_service.create_checkout_session(
            amount_cents=body.amount_cents,
            currency=body.currency,
            success_url=body.success_url,
            cancel_url=body.cancel_url,
            description=body.description,
            metadata=body.metadata,
        )
        return {"url": session.url, "session_id": session.id}
    except stripe.StripeError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e.user_message) if e.user_message else "Payment request failed",
        )


@webhook_router.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("Stripe-Signature", "")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        # TODO: update order/listing state, notify seller, etc.
        pass

    return {"received": True}
