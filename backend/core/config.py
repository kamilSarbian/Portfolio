from __future__ import annotations

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


API_DIR = Path(__file__).resolve().parents[1]
ENV_PATH = API_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "portfolio-api"

    # HIBP / HTTP
    hibp_base: str = "https://api.pwnedpasswords.com"
    http_timeout_s: float = 10.0

    # Upload
    max_upload_mb: int = 10
    allowed_mime: set[str] = {"image/jpeg", "image/png", "image/webp"}

    # Email
    email_enabled: bool = True
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    owner_email: str = ""

    # ML
    clip_model: str = "ViT-B-32"
    clip_pretrained: str = "laion2b_s34b_b79k"
    clip_device: str = "cpu"

    database_url: str = "postgresql+psycopg2://postgres:postgres@127.0.0.1:5432/portfolio"
    jwt_secret: str = ""
    jwt_alg: str = "HS256"
    access_token_expire_min: int = 60

    # Lightweight in-memory rate limiting for demo/public endpoints.
    rate_limit_window_s: int = 60
    rate_limit_auth: int = 10
    rate_limit_contact: int = 5
    rate_limit_upload: int = 20

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()
