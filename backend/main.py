from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.payments import router as payments_router, webhook_router

app = FastAPI(
    title="Spartan Marketplace API",
    description="Backend API for Spartan Marketplace",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(payments_router)
app.include_router(webhook_router)


@app.get("/")
async def root():
    return {"message": "Spartan Marketplace API", "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
