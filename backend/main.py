from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import init_db
from backend.routes import workers, policies, disruptions, claims, payouts, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="ZeroLoss API",
    description="AI-Powered Parametric Income Insurance for Gig Workers",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workers.router,     prefix="/workers",     tags=["Workers"])
app.include_router(policies.router,    prefix="/policies",    tags=["Policies"])
app.include_router(disruptions.router, prefix="/disruptions", tags=["Disruptions"])
app.include_router(claims.router,      prefix="/claims",      tags=["Claims"])
app.include_router(payouts.router,     prefix="/payouts",     tags=["Payouts"])
app.include_router(admin.router,       prefix="/admin",       tags=["Admin"])


@app.get("/", tags=["Health"])
def root():
    return {
        "project": "ZeroLoss",
        "tagline": "Zero Income Loss. Guaranteed Automatically.",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy", "database": "connected"}