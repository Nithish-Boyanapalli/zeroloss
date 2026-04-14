from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.database import init_db
from backend.routes import workers, policies, disruptions, claims, payouts, admin
from backend.routes import analytics                          # NEW Phase 3
from backend.services.scheduler import start_scheduler, stop_scheduler  # NEW Phase 3


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    start_scheduler()                                         # NEW Phase 3
    print("✅ Background scheduler started — 4 jobs running")
    yield
    # Shutdown
    stop_scheduler()                                          # NEW Phase 3
    print("🛑 Scheduler stopped.")


app = FastAPI(
    title="ZeroLoss API",
    description="AI-Powered Parametric Income Insurance for Gig Workers",
    version="3.0.0",                                         # bumped to 3.0
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],                                     # allow Vercel frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Existing routers
app.include_router(workers.router,     prefix="/workers",     tags=["Workers"])
app.include_router(policies.router,    prefix="/policies",    tags=["Policies"])
app.include_router(disruptions.router, prefix="/disruptions", tags=["Disruptions"])
app.include_router(claims.router,      prefix="/claims",      tags=["Claims"])
app.include_router(payouts.router,     prefix="/payouts",     tags=["Payouts"])
app.include_router(admin.router,       prefix="/admin",       tags=["Admin"])

# NEW Phase 3
app.include_router(analytics.router,   prefix="/analytics",   tags=["Analytics"])


@app.get("/", tags=["Health"])
def root():
    return {
        "project": "ZeroLoss",
        "tagline": "Zero Income Loss. Guaranteed Automatically.",
        "version": "3.0.0",
        "status": "running",
        "phase": "SOAR — Phase 3",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    from backend.services.scheduler import get_scheduler_status
    return {
        "status": "healthy",
        "database": "connected",
        "scheduler": get_scheduler_status(),
    }