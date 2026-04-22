from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services import orders_service

router = APIRouter(prefix="/orders", tags=["orders"])


class CreateOrderRequest(BaseModel):
    listing_id: str = Field(..., min_length=1)
    buyer_id: str = Field(..., min_length=1)
    seller_id: str = Field(..., min_length=1)
    amount_cents: int = Field(..., gt=0)


class UpdateOrderRequest(BaseModel):
    status: str = Field(..., min_length=1)


@router.post("", status_code=201)
def create_order(body: CreateOrderRequest):
    order = orders_service.create_order(
        listing_id=body.listing_id,
        buyer_id=body.buyer_id,
        seller_id=body.seller_id,
        amount_cents=body.amount_cents,
    )
    return order


@router.get("")
def list_orders():
    return orders_service.get_orders()


@router.get("/{order_id}")
def get_order(order_id: str):
    order = orders_service.get_order_by_id(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}")
def update_order(order_id: str, body: UpdateOrderRequest):
    updated = orders_service.update_order(
        order_id=order_id,
        updates=body.model_dump(exclude_unset=True)
    )
    if updated is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated