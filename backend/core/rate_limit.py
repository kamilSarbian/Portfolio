from __future__ import annotations

import time
from collections import defaultdict, deque
from collections.abc import Callable

from fastapi import HTTPException, Request, status

from .config import settings


_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def _client_key(request: Request, scope: str) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    ip = forwarded.split(",")[0].strip() if forwarded else None
    if not ip and request.client:
        ip = request.client.host
    return f"{scope}:{ip or 'unknown'}"


def rate_limiter(scope: str, limit: int) -> Callable[[Request], None]:
    def dependency(request: Request) -> None:
        now = time.monotonic()
        window = settings.rate_limit_window_s
        key = _client_key(request, scope)
        bucket = _BUCKETS[key]

        while bucket and now - bucket[0] > window:
            bucket.popleft()

        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )

        bucket.append(now)

    return dependency


auth_rate_limit = rate_limiter("auth", settings.rate_limit_auth)
contact_rate_limit = rate_limiter("contact", settings.rate_limit_contact)
upload_rate_limit = rate_limiter("upload", settings.rate_limit_upload)
