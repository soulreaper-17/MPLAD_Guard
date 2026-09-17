from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.report_service import generate_project_report, submit_public_report, get_public_reports
from backend.app.models.api_models import PublicReportCreateRequest, PublicReportListResponse

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/project/{project_id}")
def get_report(project_id: str, db: Session = Depends(get_db)):
    rep = generate_project_report(db, project_id)
    if not rep:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found")
    return rep

@router.post("/project/{project_id}/public-report")
def post_public_report(
    project_id: str,
    req: PublicReportCreateRequest,
    db: Session = Depends(get_db)
):
    try:
        res = submit_public_report(
            db,
            project_id=project_id,
            complaint_text=req.complaint_text,
            user_email=req.user_email or "citizen@mpladguard.gov.in",
            user_name=req.user_name or "Public Citizen"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/project/{project_id}/public-reports", response_model=PublicReportListResponse)
def get_public_reports_route(
    project_id: str,
    user_email: str = Query("citizen@mpladguard.gov.in"),
    db: Session = Depends(get_db)
):
    res = get_public_reports(db, project_id=project_id, user_email=user_email)
    return res

