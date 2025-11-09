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
    "https://tabetg.github.io",  # Github Pages
    "http://localhost:5173",     # Vite dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allow_headers=["*"],
    max_age=600,
)

app.include_router(routes.router, prefix=API_PREFIX)

@app.get("/", tags=["Health"])
def root():
    return {"name": APP_NAME, "version": APP_VERSION, "status": "running", "docs": "/docs"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
