from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.api_models import AgencySummary, AgencyDetail
from backend.app.services.agency_service import get_agencies, get_agency_by_id

router = APIRouter(prefix="/agencies", tags=["Agencies"])

@router.get("", response_model=List[AgencySummary])
def list_agencies(db: Session = Depends(get_db)):
    return get_agencies(db)

@router.get("/{agency_id}", response_model=AgencyDetail)
def get_agency(agency_id: str, db: Session = Depends(get_db)):
    agency = get_agency_by_id(db, agency_id)
    if not agency:
        raise HTTPException(status_code=404, detail=f"Agency {agency_id} not found")
    return agency
