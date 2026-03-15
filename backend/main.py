from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.passwords import router as passwords_router
from routers.images import router as images_router
from routers.contact import router as contact_router
from routers.vision import router as ml_router
from routers.auth import router as auth_router
from routers.users import router as users_router

from core.db import Base, engine
from models.user import User

app = FastAPI(title="Portfolio API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://kamilsarbian-dev.vercel.app",
        "https://portfolio-6mlh3g953-kamilsarbians-projects.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(passwords_router)
app.include_router(images_router)
app.include_router(contact_router)
app.include_router(ml_router)
app.include_router(auth_router)
app.include_router(users_router)


@app.get("/")
def root():
    return {"message": "Portfolio API is running"}


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/version")
def version():
    return {
        "service": "portfolio-api",
        "version": "1.0.0"
    }