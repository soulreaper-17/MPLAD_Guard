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
