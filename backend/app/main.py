# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import routes
from app.core.config import APP_NAME, APP_VERSION, APP_DESCRIPTION, API_PREFIX

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description=APP_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

ALLOWED_ORIGINS = [
    "https://tabetg.github.io",  # GitHub Pages (ne pas mettre le chemin /Calculatrice_RPN)
    "http://localhost:5173",     # dev Vite
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,           # True seulement si tu utilises des cookies
    allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

app.include_router(routes.router, prefix=API_PREFIX)

@app.get("/", tags=["Health"])
def root():
    return {"name": APP_NAME, "version": APP_VERSION, "status": "running", "docs": "/docs"}
