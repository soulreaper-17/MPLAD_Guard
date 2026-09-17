from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.geo_service import get_map_projects, get_nearby_projects

router = APIRouter(prefix="/map", tags=["Geographic Intelligence"])

@router.get("/markers")
def get_markers(
    constituency: Optional[str] = Query(None),
    min_priority: Optional[float] = Query(None),
    work_type: Optional[str] = Query(None),
    agency_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return get_map_projects(db, constituency=constituency, min_priority=min_priority, work_type=work_type, agency_id=agency_id)

@router.get("/nearby/{project_id}")
def get_nearby(
    project_id: str,
    radius_km: float = Query(3.0, ge=0.1, le=20.0),
    db: Session = Depends(get_db)
):
    return get_nearby_projects(db, project_id, radius_km=radius_km)
