from fastapi import APIRouter, HTTPException

from pydantic import BaseModel, Field

from services import listings_service

router = APIRouter(prefix="/listings", tags=["listings"])


class CreateListingRequest(BaseModel):
    title: str = Field(..., min_length=1)
    description: str | None = None
    price_cents: int = Field(..., gt=0)
    category: str | None = None
    image_url: str | None = None
    image_urls: list[str] | None = None
    seller_id: str | None = None


class UpdateListingRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    price_cents: int | None = None
    category: str | None = None
    image_url: str | None = None
    image_urls: list[str] | None = None

@router.post("", status_code=201)
def create_listing(body: CreateListingRequest):
    listing = listings_service.create_listing(
        title=body.title,
        description=body.description,
        price_cents=body.price_cents,
        category=body.category,
        image_url=body.image_url,
        image_urls=body.image_urls,
        seller_id=body.seller_id,
    )
    return listing


@router.get("")
def list_listings():
    return listings_service.get_listings()


@router.get("/{listing_id}")
def get_listing(listing_id: str):
    listing = listings_service.get_listing_by_id(listing_id)
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing

@router.patch("/{listing_id}")
def update_listing(listing_id: str, body: UpdateListingRequest):
    updated = listings_service.update_listing(
        listing_id = listing_id,
        updates = body.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail = "Listing is not found")
    return updated

@router.delete("/{listing_id}")
def delete_listing(listing_id: str):
    deleted = listings_service.delete_listing(listing_id)
    if deleted is None:
        raise HTTPException(status_code=404, detail = "Listing not found")
    return {"message" : "Listing removed"}
    
