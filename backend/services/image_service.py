from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from PIL import Image, ImageOps, UnidentifiedImageError


@dataclass(frozen=True)
class ProcessOptions:
    size: str          # "S" | "M" | "L"
    grayscale: bool
    rotate: int        # 0 | 90 | 180 | 270


SIZE_MAX = {"S": 320, "M": 640, "L": 1024}


class ImageProcessingError(ValueError):
    pass


def _validate(opts: ProcessOptions) -> None:
    if opts.size not in SIZE_MAX:
        raise ImageProcessingError("Invalid size. Allowed: S, M, L.")
    if opts.rotate not in (0, 90, 180, 270):
        raise ImageProcessingError("Invalid rotate. Allowed: 0, 90, 180, 270.")


def _resize_keep_aspect(img: Image.Image, max_side: int) -> Image.Image:
    w, h = img.size
    scale = min(1.0, max_side / float(max(w, h)))
    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))
    return img.resize((new_w, new_h), resample=Image.LANCZOS)


def process_image_to_png(data: bytes, opts: ProcessOptions) -> bytes:
    _validate(opts)

    try:
        img = Image.open(BytesIO(data))
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGBA")
    except (OSError, UnidentifiedImageError) as e:
        raise ImageProcessingError("Failed to decode image.") from e

    img = _resize_keep_aspect(img, SIZE_MAX[opts.size])

    if opts.grayscale:
        gray = ImageOps.grayscale(img)
        img = Image.merge("RGBA", (gray, gray, gray, img.getchannel("A")))

    if opts.rotate:
        img = img.rotate(-opts.rotate, expand=True)

    out = BytesIO()
    img.save(out, format="PNG", optimize=True)
    return out.getvalue()
