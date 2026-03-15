import stripe

from config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(
    *,
    amount_cents: int,
    currency: str = "usd",
    success_url: str,
    cancel_url: str,
    description: str | None = None,
    metadata: dict[str, str] | None = None,
) -> stripe.checkout.Session:
    line_item: dict = {
        "price_data": {
            "currency": currency,
            "unit_amount": amount_cents,
            "product_data": {
                "name": description or "Spartan Marketplace item",
            },
        },
        "quantity": 1,
    }
    params: dict = {
        "mode": "payment",
        "payment_method_types": ["card"],
        "line_items": [line_item],
        "success_url": success_url,
        "cancel_url": cancel_url,
    }
    if metadata:
        params["metadata"] = metadata
    return stripe.checkout.Session.create(**params)
