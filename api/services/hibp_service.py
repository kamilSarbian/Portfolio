from __future__ import annotations

import hashlib
from dataclasses import dataclass
import httpx


@dataclass(frozen=True)
class HIBPResult:
    found: bool
    count: int


def sha1_upper(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8")).hexdigest().upper()


async def query_pwned_password_range(
    client: httpx.AsyncClient,
    hibp_base: str,
    password: str,
) -> HIBPResult:
    """
    HIBP k-Anonymity:
    - SHA1(password) => PREFIX(5) + SUFFIX(35)
    - GET /range/{PREFIX} => lines: SUFFIX:COUNT
    - Dopasowanie SUFFIX robimy lokalnie
    """
    h = sha1_upper(password)
    prefix, suffix = h[:5], h[5:]

    url = f"{hibp_base}/range/{prefix}"
    headers = {
        "User-Agent": "portfolio-pwned-checker/1.0",
        "Add-Padding": "true",  # opcjonalnie (privacy)
    }

    resp = await client.get(url, headers=headers)
    resp.raise_for_status()

    count = 0
    for line in resp.text.splitlines():
        if ":" not in line:
            continue
        suf, c = line.split(":", 1)
        if suf.strip().upper() == suffix:
            try:
                count = int(c.strip())
            except ValueError:
                count = 0
            break

    return HIBPResult(found=count > 0, count=count)


async def check_password_pwned(
    password: str,
    hibp_base: str,
    timeout_s: float = 10.0,
) -> HIBPResult:
    """
    Wygodny wrapper: router nie musi ogarniać httpx.AsyncClient.
    """
    async with httpx.AsyncClient(timeout=timeout_s) as client:
        return await query_pwned_password_range(
            client=client,
            hibp_base=hibp_base,
            password=password,
        )
