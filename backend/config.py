from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    STRIPE_PUBLISHABLE_KEY: str | None = None

    # Supabase (add when integrating later)
    # SUPABASE_URL: str | None = None
    # SUPABASE_ANON_KEY: str | None = None


settings = Settings()
