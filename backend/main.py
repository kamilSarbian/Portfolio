from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routers.passwords import router as passwords_router
from routers.images import router as images_router
from routers.contact import router as contact_router
from routers.vision import router as ml_router
from routers.auth import router as auth_router
from routers.users import router as users_router
from schemas.common import HealthResponse, MessageResponse, VersionResponse

OPENAPI_TAGS = [
    {"name": "meta", "description": "Service metadata and operational health endpoints."},
    {"name": "auth", "description": "User registration and JWT authentication."},
    {"name": "users", "description": "Authenticated profile access and admin-only user listing."},
    {"name": "passwords", "description": "Password breach checks using the Have I Been Pwned k-Anonymity flow."},
    {"name": "images", "description": "Image upload and transformation endpoints."},
    {"name": "ml", "description": "CLIP-based image classification, presets, and taxonomy endpoints."},
    {"name": "contact", "description": "Contact form submission and email delivery workflow."},
]


class _UTF8JSONResponse(JSONResponse):
    media_type = "application/json; charset=utf-8"


app = FastAPI(
    title="Portfolio API",
    version="1.0.0",
    summary="Backend portfolio API built with FastAPI, PostgreSQL, JWT auth, image processing, and ML.",
    description=(
        "A portfolio backend demonstrating production-style API design with FastAPI, "
        "JWT authentication, PostgreSQL integration, image processing, contact email flow, "
        "and CLIP-based image classification."
    ),
    openapi_tags=OPENAPI_TAGS,
    default_response_class=_UTF8JSONResponse,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kamilsarbian.dev",
        "https://www.kamilsarbian.dev",
        "https://kamilsarbian-dev.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(passwords_router)
app.include_router(images_router)
app.include_router(contact_router)
app.include_router(ml_router)
app.include_router(auth_router)
app.include_router(users_router)


@app.get(
    "/",
    tags=["meta"],
    summary="Service overview",
    description="Basic root endpoint confirming that the Portfolio API is running.",
    response_model=MessageResponse,
)
def root():
    return {"message": "Portfolio API is running"}


@app.get(
    "/health",
    tags=["meta"],
    summary="Health check",
    description="Simple liveness endpoint for uptime checks and deployment verification.",
    response_model=HealthResponse,
)
def health():
    return {"ok": True}


@app.get(
    "/version",
    tags=["meta"],
    summary="Service version",
    description="Returns the current service identifier and API version.",
    response_model=VersionResponse,
)
def version():
    return {
        "service": "portfolio-api",
        "version": "1.0.0"
    }
