import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.api.auth_routes import router as auth_router
from backend.app.api.dashboard_routes import router as dashboard_router
from backend.app.api.project_routes import router as project_router
from backend.app.api.agency_routes import router as agency_router
from backend.app.api.map_routes import router as map_router
from backend.app.api.graph_routes import router as graph_router
from backend.app.api.assistant_routes import router as assistant_router
from backend.app.api.report_routes import router as report_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_SUBTITLE,
    version=settings.VERSION,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# Enable CORS for Next.js frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(project_router, prefix=settings.API_PREFIX)
app.include_router(agency_router, prefix=settings.API_PREFIX)
app.include_router(map_router, prefix=settings.API_PREFIX)
app.include_router(graph_router, prefix=settings.API_PREFIX)
app.include_router(assistant_router, prefix=settings.API_PREFIX)
app.include_router(report_router, prefix=settings.API_PREFIX)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "constituency": settings.CONSTITUENCY,
        "mode": "SIH Prototype / Demo Environment",
        "guardrail": "Evidence-Based Risk Scoring"
    }
