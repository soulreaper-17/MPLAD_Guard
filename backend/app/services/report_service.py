from typing import Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from backend.app.services.project_service import get_project_by_id
from backend.app.services.peer_service import get_peer_comparison
from backend.app.services.agency_service import get_agency_by_id
from backend.app.services.geo_service import get_nearby_projects

def generate_project_report(db: Session, project_id: str) -> Optional[Dict[str, Any]]:
    proj_detail = get_project_by_id(db, project_id)
    if not proj_detail:
        return None
        
    peer_data = get_peer_comparison(db, project_id)
    agency_data = get_agency_by_id(db, proj_detail.agency_id) if proj_detail.agency_id else None
    nearby_data = get_nearby_projects(db, project_id, radius_km=3.0)
    
    report = {
        "report_id": f"REP-{project_id}-{datetime.utcnow().strftime('%Y%m%d%H%M')}",
        "generated_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "platform": "MPLAD-GUARD AI (Investigation Intelligence Layer)",
        "guardrail_notice": "THIS REPORT CONTAINS ANALYTICAL RISK SIGNALS FOR INVESTIGATION PRIORITIZATION AND FIELD AUDIT SCHEDULING.",
        "project": proj_detail.model_dump(),
        "peer_comparison": peer_data.model_dump() if peer_data else None,
        "agency_profile": agency_data.model_dump() if agency_data else None,
        "geographic_context": nearby_data,
        "dossier_summary": {
            "priority_score": proj_detail.risk.priority_score if proj_detail.risk else 0.0,
            "financial_risk": proj_detail.risk.financial_risk if proj_detail.risk else 0.0,
            "timeline_risk": proj_detail.risk.timeline_risk if proj_detail.risk else 0.0,
            "agency_risk": proj_detail.risk.agency_risk if proj_detail.risk else 0.0,
            "geographic_risk": proj_detail.risk.geographic_risk if proj_detail.risk else 0.0,
            "similarity_risk": proj_detail.risk.similarity_risk if proj_detail.risk else 0.0,
            "investigation_status": proj_detail.investigation_status,
            "investigator_notes": proj_detail.investigation.notes if proj_detail.investigation else "",
            "recommended_actions": proj_detail.risk.recommended_verification if proj_detail.risk else []
        }
    }
    return report

def extract_ai_critical_points(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    points = []
    urgency = "MEDIUM"

    if any(w in text_lower for w in ["delay", "incomplete", "stopped", "abandoned", "pending", "half", "late"]):
        points.append("Execution & Progress Discrepancy: Ground status indicates halted or delayed work execution.")
        urgency = "HIGH"
    if any(w in text_lower for w in ["money", "cost", "price", "corrupt", "bribe", "fund", "fake", "bill", "fraud"]):
        points.append("Financial Integrity Alert: Citizen reported suspected over-invoicing or fund mismanagement.")
        urgency = "HIGH"
    if any(w in text_lower for w in ["crack", "poor", "substandard", "broken", "material", "quality", "bad", "damage"]):
        points.append("Quality Assessment Flaw: Substandard material or structural weakness observed on-site.")

    if not points:
        points.append("Ground Observation Report: Public citizen filed a ground audit report for field inspection.")
        points.append("Verifiable Location Data: Citizen submitted localized feedback for physical audit verification.")
        points.append("Public Scrutiny Flag: Citizen requested vigilance check on project milestone completion.")

    return {"critical_points": points[:3], "urgency": urgency}


def submit_public_report(db: Session, project_id: str, complaint_text: str, user_email: str = "citizen@mpladguard.gov.in", user_name: str = "Public Citizen") -> Dict[str, Any]:
    from backend.app.models.schema import PublicReport, Evidence
    
    # 1. Capacity limit check: Max 1000 reports per project
    total_count = db.query(PublicReport).filter(PublicReport.project_id == project_id).count()
    if total_count >= 1000:
        raise Exception("Maximum capacity of 1000 reports reached for this project.")

    # 2. Daily Rate limit check: Max 1 report per user per day for this project
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    user_today_count = db.query(PublicReport).filter(
        PublicReport.project_id == project_id,
        PublicReport.user_email == user_email,
        PublicReport.created_at >= start_of_day
    ).count()

    if user_today_count >= 1:
        raise Exception("You have already submitted a report for this project today. Maximum 1 report per user per day allowed.")

    # 3. AI Critical Point Analysis
    ai_res = extract_ai_critical_points(complaint_text)

    # 4. Insert Public Report
    report_obj = PublicReport(
        project_id=project_id,
        user_email=user_email,
        user_name=user_name,
        complaint_text=complaint_text,
        ai_critical_points=ai_res["critical_points"],
        ai_urgency=ai_res["urgency"],
        status="PENDING",
        created_at=datetime.utcnow()
    )
    db.add(report_obj)

    # 5. Insert synthetic evidence item so officers see citizen report in evidence locker
    evd_obj = Evidence(
        evidence_id=f"EVD-CITIZEN-{int(datetime.utcnow().timestamp())}",
        project_id=project_id,
        title=f"Citizen Ground Feedback ({user_name})",
        source="Public Citizen Complaint Portal",
        evidence_type="PUBLIC_REPORT",
        content=f"Report Filed by {user_name} ({user_email}): \"{complaint_text}\". AI Key Extraction: {'; '.join(ai_res['critical_points'])}.",
        relevance="HIGH" if ai_res["urgency"] == "HIGH" else "MEDIUM"
    )
    db.add(evd_obj)
    db.commit()
    db.refresh(report_obj)

    return {
        "report_id": report_obj.report_id,
        "project_id": report_obj.project_id,
        "user_email": report_obj.user_email,
        "user_name": report_obj.user_name,
        "complaint_text": report_obj.complaint_text,
        "ai_critical_points": report_obj.ai_critical_points,
        "ai_urgency": report_obj.ai_urgency,
        "status": report_obj.status,
        "created_at": report_obj.created_at.isoformat()
    }


def get_public_reports(db: Session, project_id: str, user_email: str = "citizen@mpladguard.gov.in") -> Dict[str, Any]:
    from backend.app.models.schema import PublicReport
    
    reports = db.query(PublicReport).filter(PublicReport.project_id == project_id).order_by(PublicReport.created_at.desc()).all()
    total_count = len(reports)
    
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    user_today_count = db.query(PublicReport).filter(
        PublicReport.project_id == project_id,
        PublicReport.user_email == user_email,
        PublicReport.created_at >= start_of_day
    ).count()

    can_submit_today = (user_today_count == 0) and (total_count < 1000)

    items = []
    for r in reports:
        items.append({
            "report_id": r.report_id,
            "project_id": r.project_id,
            "user_email": r.user_email,
            "user_name": r.user_name,
            "complaint_text": r.complaint_text,
            "ai_critical_points": r.ai_critical_points or [],
            "ai_urgency": r.ai_urgency or "MEDIUM",
            "status": r.status or "PENDING",
            "created_at": r.created_at.isoformat() if r.created_at else ""
        })

    return {
        "project_id": project_id,
        "total_reports_count": total_count,
        "max_capacity": 1000,
        "user_can_submit_today": can_submit_today,
        "reports": items
    }

