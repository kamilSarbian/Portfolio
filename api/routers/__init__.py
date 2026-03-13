from .passwords import router as passwords_router
from .images import router as images_router
from .contact import router as contact_router
from .vision import router as ml_router

__all__ = ["passwords_router", "images_router", "contact_router", "ml_router"]