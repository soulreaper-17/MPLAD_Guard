from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.report_service import generate_project_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/project/{project_id}")
def get_report(project_id: str, db: Session = Depends(get_db)):
    rep = generate_project_report(db, project_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return rep
