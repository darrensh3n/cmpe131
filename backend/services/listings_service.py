import uuid
from datetime import datetime, timezone
from typing import Any


_listings: dict[str, dict[str, Any]] = {}


def create_listing(
    *,
    title: str,
    description: str | None = None,
    price_cents: int,
    category: str | None = None,
    image_url: str | None = None,
    image_urls: list[str] | None = None,
    seller_id: str | None = None,
) -> dict[str, Any]:
    now = datetime.now(timezone.utc).isoformat()
    listing_id = str(uuid.uuid4())
    listing = {
        "id": listing_id,
        "title": title,
        "description": description,
        "price_cents": price_cents,
        "category": category,
        "image_url": image_url,
        "image_urls": image_urls or [],
        "seller_id": seller_id,
        "status": "active",
        "created_at": now,
    }
    _listings[listing_id] = listing
    return listing


def get_listings() -> list[dict[str, Any]]:
    items = [listing for listing in _listings.values() if listing.get("status") == "active"]
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return items


def get_listing_by_id(listing_id: str) -> dict[str, Any] | None:
    return _listings.get(listing_id)

def update_listing(listing_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    listing = _listings.get(listing_id)
    if listing is None:
        return None
    
    listing.update(updates)
    return listing

def delete_listing(listing_id: str) -> dict[str, Any] | None:
    listing = _listings.get(listing_id)
    if listing is None:
        return None
    
    listing["status"] = "removed"
    return listing