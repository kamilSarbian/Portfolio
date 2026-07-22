import asyncio
from io import BytesIO

import pytest
from fastapi import UploadFile
from services.upload_service import UploadTooLargeError, read_upload_limited


def test_read_upload_limited_returns_content_within_limit() -> None:
    upload = UploadFile(filename="image.png", file=BytesIO(b"abc"))

    assert asyncio.run(read_upload_limited(upload, max_bytes=3)) == b"abc"


def test_read_upload_limited_rejects_oversized_content() -> None:
    upload = UploadFile(filename="image.png", file=BytesIO(b"abcd"))

    with pytest.raises(UploadTooLargeError):
        asyncio.run(read_upload_limited(upload, max_bytes=3))
