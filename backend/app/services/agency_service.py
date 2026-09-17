from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.schema import Agency, Project, Risk, Investigation
from backend.app.models.api_models import AgencySummary, AgencyDetail, ProjectSummary

from backend.pipeline.seed_db import seed_constituency_if_needed

def get_agencies(db: Session, constituency: Optional[str] = None) -> List[AgencySummary]:
    if constituency and constituency.lower() not in ["all_india", "all", "national"]:
        seed_constituency_if_needed(db, constituency)
        token = constituency.lower().replace('-', '_').replace(' ', '_').split('_')[0]
        agency_ids = [r[0] for r in db.query(Project.agency_id).filter(Project.constituency.ilike(f"%{token}%")).distinct().all()]
        agencies = db.query(Agency).filter(Agency.agency_id.in_(agency_ids)).order_by(Agency.project_count.desc()).all()
    else:
        agencies = db.query(Agency).order_by(Agency.project_count.desc()).all()

    summaries = []
    for a in agencies:
        summaries.append(AgencySummary(
            agency_id=a.agency_id,
            agency_name=a.agency_name,
            agency_type=a.agency_type,
            district=a.district,
            state=a.state,
            project_count=a.project_count,
            completed_count=a.completed_count,
            delayed_count=a.delayed_count,
            completion_rate=a.completion_rate,
            delay_rate=a.delay_rate,
            average_cost=a.average_cost,
            average_delay=a.average_delay,
            risk_profile_level=a.risk_profile_level
        ))
    return summaries

def get_agency_by_id(db: Session, agency_id: str) -> Optional[AgencyDetail]:
    agency = db.query(Agency).filter(Agency.agency_id == agency_id).first()
    if not agency:
        return None
        
    projects = db.query(Project, Risk, Investigation).outerjoin(
        Risk, Project.project_id == Risk.project_id
    ).outerjoin(
        Investigation, Project.project_id == Investigation.project_id
    ).filter(
        Project.agency_id == agency_id
    ).all()
    
    work_dist: Dict[str, int] = {}
    proj_summaries: List[ProjectSummary] = []
    
    for p, r, inv in projects:
        work_dist[p.work_type] = work_dist.get(p.work_type, 0) + 1
        proj_summaries.append(ProjectSummary(
            project_id=p.project_id,
            project_name=p.project_name,
            work_type=p.work_type,
            status=p.status,
            constituency=p.constituency,
            district=p.district,
            agency_id=p.agency_id,
            agency_name=agency.agency_name,
            sanctioned_amount=p.sanctioned_amount,
            released_amount=p.released_amount,
            expenditure=p.expenditure,
            sanction_date=p.sanction_date,
            start_date=p.start_date,
            expected_completion_date=p.expected_completion_date,
            actual_completion_date=p.actual_completion_date,
            latitude=p.latitude,
            longitude=p.longitude,
            priority_score=r.priority_score if r else 0.0,
            is_anomaly=r.is_anomaly if r else False,
            investigation_status=inv.status if inv else "NEW"
        ))
        
    # Generate historical behavioural risk signals
    risk_signals = []
    if agency.delay_rate >= 0.60:
        risk_signals.append(f"Elevated historical delay rate: {agency.delay_rate*100:.0f}% of projects suffered timeline overruns.")
    if agency.average_delay > 90:
        risk_signals.append(f"Average execution timeline overrun is {agency.average_delay:.0f} days across portfolio.")
    if agency.risk_profile_level == "HIGH":
        risk_signals.append("Agency risk profile classified as HIGH due to repetitive timeline slippage and cost escalation.")
    elif agency.risk_profile_level == "ELEVATED":
        risk_signals.append("Agency flagged for moderate monitoring priority.")
    else:
        risk_signals.append("Standard operating baseline: Agency adheres to regular execution timelines.")

    return AgencyDetail(
        agency_id=agency.agency_id,
        agency_name=agency.agency_name,
        agency_type=agency.agency_type,
        district=agency.district,
        state=agency.state,
        project_count=agency.project_count,
        completed_count=agency.completed_count,
        delayed_count=agency.delayed_count,
        completion_rate=agency.completion_rate,
        delay_rate=agency.delay_rate,
        average_cost=agency.average_cost,
        average_delay=agency.average_delay,
        risk_profile_level=agency.risk_profile_level,
        work_type_distribution=work_dist,
        associated_projects=proj_summaries,
        historical_risk_signals=risk_signals
    )
