from __future__ import annotations

import time
from collections import defaultdict, deque
from collections.abc import Callable
from threading import Lock

from fastapi import HTTPException, Request, status

from .config import settings

_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_BUCKETS_LOCK = Lock()
_CLEANUP_INTERVAL = 256
_request_count = 0


def _client_key(request: Request, scope: str) -> str:
    ip = request.client.host if request.client else None
    return f"{scope}:{ip or 'unknown'}"


def _remove_stale_buckets(now: float, window: float) -> None:
    stale_keys = [
        key for key, bucket in _BUCKETS.items() if not bucket or now - bucket[-1] > window
    ]
    for key in stale_keys:
        _BUCKETS.pop(key, None)


def rate_limiter(scope: str, limit: int) -> Callable[[Request], None]:
    """Create a process-local request limiter dependency.

    Args:
        scope: Namespace separating limits for different endpoint groups.
        limit: Maximum requests allowed during the configured time window.

    Returns:
        FastAPI dependency enforcing the configured request limit.
    """

    def dependency(request: Request) -> None:
        """Reject requests that exceed the scoped process-local limit."""

        global _request_count

        now = time.monotonic()
        window = settings.rate_limit_window_s
        key = _client_key(request, scope)

        with _BUCKETS_LOCK:
            _request_count += 1
            if _request_count % _CLEANUP_INTERVAL == 0:
                _remove_stale_buckets(now, window)

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
password_rate_limit = rate_limiter("password", settings.rate_limit_password)
upload_rate_limit = rate_limiter("upload", settings.rate_limit_upload)
