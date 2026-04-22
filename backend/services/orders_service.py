import uuid
from datetime import datetime, timezone
from typing import Any


_orders: dict[str, dict[str, Any]] = {}


def create_order(
    *,
    listing_id: str,
    buyer_id: str,
    seller_id: str,
    amount_cents: int,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    order_id = str(uuid.uuid4())

    order = {
        "id": order_id,
        "listing_id": listing_id,
        "buyer_id": buyer_id,
        "seller_id": seller_id,
        "amount_cents": amount_cents,
        "status": "pending",
        "created_at": now,
    }

    _orders[order_id] = order
    return order


def get_orders() -> list[dict[str, Any]]:
    items = list(_orders.values())
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return items


def get_order_by_id(order_id: str) -> dict[str, Any] | None:
    return _orders.get(order_id)


def update_order(order_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    order = _orders.get(order_id)
    if order is None:
        return None

    order.update(updates)
    return order