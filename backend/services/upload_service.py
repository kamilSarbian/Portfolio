from __future__ import annotations

from fastapi import UploadFile


class UploadTooLargeError(ValueError):
    """Raised when an uploaded file exceeds the configured byte limit."""


async def read_upload_limited(upload: UploadFile, max_bytes: int) -> bytes:
    """Read an uploaded file while enforcing a strict byte limit.

    Args:
        upload: FastAPI upload object to read.
        max_bytes: Maximum accepted payload size in bytes.

    Returns:
        Uploaded file contents.

    Raises:
        UploadTooLargeError: If the upload is larger than ``max_bytes``.
    """

    data = await upload.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise UploadTooLargeError("Uploaded file exceeds the configured size limit.")
    return data
