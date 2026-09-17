from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.api_models import (
    ProjectSummary, ProjectDetail, PeerComparisonResponse,
    InvestigationUpdate, InvestigationDetail
)
from backend.app.services.project_service import get_projects, get_project_by_id, update_investigation
from backend.app.services.peer_service import get_peer_comparison

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectSummary])
def list_projects(
    constituency: Optional[str] = Query(None, description="Filter by constituency"),
    status: Optional[str] = Query(None, description="Filter by status (Ongoing, Completed, Delayed)"),
    work_type: Optional[str] = Query(None, description="Filter by work type"),
    agency_id: Optional[str] = Query(None, description="Filter by agency ID"),
    min_priority: Optional[float] = Query(None, description="Minimum priority score"),
    max_priority: Optional[float] = Query(None, description="Maximum priority score"),
    search: Optional[str] = Query(None, description="Search term for project ID, name, or agency"),
    sort_by: str = Query("priority_score", description="Sort field (priority_score, sanctioned_amount, sanction_date)"),
    sort_order: str = Query("desc", description="Sort order (desc, asc)"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return get_projects(
        db, constituency=constituency, status=status, work_type=work_type, agency_id=agency_id,
        min_priority=min_priority, max_priority=max_priority, search=search,
        sort_by=sort_by, sort_order=sort_order, limit=limit, offset=offset
    )

@router.get("/{project_id}", response_model=ProjectDetail)
def get_project(project_id: str, db: Session = Depends(get_db)):
    proj = get_project_by_id(db, project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return proj

@router.get("/{project_id}/peers", response_model=PeerComparisonResponse)
def get_peers(project_id: str, db: Session = Depends(get_db)):
    peers = get_peer_comparison(db, project_id)
    if not peers:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return peers

@router.patch("/{project_id}/investigation", response_model=InvestigationDetail)
def update_project_investigation(
    project_id: str,
    req: InvestigationUpdate,
    db: Session = Depends(get_db)
):
    inv = update_investigation(db, project_id, req)
    if not inv:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return inv
