from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, or_
from backend.app.models.schema import Project, Agency, Location, Risk, Investigation, Evidence
from backend.app.models.api_models import (
    ProjectSummary, ProjectDetail, RiskDetail, InvestigationDetail,
    EvidenceItem, InvestigationUpdate, DashboardStats
)

from backend.pipeline.seed_db import seed_constituency_if_needed

def get_projects(
    db: Session,
    constituency: Optional[str] = None,
    status: Optional[str] = None,
    work_type: Optional[str] = None,
    agency_id: Optional[str] = None,
    min_priority: Optional[float] = None,
    max_priority: Optional[float] = None,
    search: Optional[str] = None,
    sort_by: str = "priority_score",
    sort_order: str = "desc",
    limit: int = 100,
    offset: int = 0
) -> List[ProjectSummary]:
    if constituency and constituency.lower() not in ["all_india", "all", "national"]:
        seed_constituency_if_needed(db, constituency)

    query = db.query(Project, Risk, Agency, Investigation).join(
        Risk, Project.project_id == Risk.project_id
    ).join(
        Agency, Project.agency_id == Agency.agency_id
    ).outerjoin(
        Investigation, Project.project_id == Investigation.project_id
    )
    
    if constituency and constituency.lower() not in ["all_india", "all", "national"]:
        token = constituency.lower().replace('-', '_').replace(' ', '_').split('_')[0]
        query = query.filter(Project.constituency.ilike(f"%{token}%"))
    if status and status != "ALL":
        query = query.filter(Project.status == status)
    if work_type and work_type != "ALL":
        query = query.filter(Project.work_type == work_type)
    if agency_id and agency_id != "ALL":
        query = query.filter(Project.agency_id == agency_id)
    if min_priority is not None:
        query = query.filter(Risk.priority_score >= min_priority)
    if max_priority is not None:
        query = query.filter(Risk.priority_score <= max_priority)
    if search:
        s_term = f"%{search}%"
        query = query.filter(
            or_(
                Project.project_name.ilike(s_term),
                Project.project_id.ilike(s_term),
                Agency.agency_name.ilike(s_term),
                Project.work_type.ilike(s_term)
            )
        )
        
    # Sort
    if sort_by == "priority_score":
        col = Risk.priority_score
    elif sort_by == "sanctioned_amount":
        col = Project.sanctioned_amount
    elif sort_by == "sanction_date":
        col = Project.sanction_date
    else:
        col = Risk.priority_score
        
    if sort_order == "asc":
        query = query.order_by(asc(col))
    else:
        query = query.order_by(desc(col))
        
    results = query.offset(offset).limit(limit).all()
    
    summaries = []
    for proj, risk, agy, inv in results:
        summaries.append(ProjectSummary(
            project_id=proj.project_id,
            project_name=proj.project_name,
            work_type=proj.work_type,
            status=proj.status,
            constituency=proj.constituency,
            district=proj.district,
            agency_id=proj.agency_id,
            agency_name=agy.agency_name if agy else None,
            sanctioned_amount=proj.sanctioned_amount,
            released_amount=proj.released_amount,
            expenditure=proj.expenditure,
            sanction_date=proj.sanction_date,
            start_date=proj.start_date,
            expected_completion_date=proj.expected_completion_date,
            actual_completion_date=proj.actual_completion_date,
            latitude=proj.latitude,
            longitude=proj.longitude,
            priority_score=risk.priority_score if risk else 0.0,
            is_anomaly=risk.is_anomaly if risk else False,
            investigation_status=inv.status if inv else "NEW"
        ))
    return summaries

def get_project_by_id(db: Session, project_id: str) -> Optional[ProjectDetail]:
    proj = db.query(Project).filter(Project.project_id == project_id).first()
    if not proj:
        # Extract constituency token from project_id (e.g. MPLAD-PAT-2023-001 -> patna)
        parts = project_id.split('-')
        if len(parts) >= 2:
            code = parts[1].lower()
            seed_constituency_if_needed(db, code)
            proj = db.query(Project).filter(Project.project_id == project_id).first()
            if not proj:
                proj = db.query(Project).filter(Project.constituency.ilike(f"%{code}%")).first()

    if not proj:
        proj = db.query(Project).first()
        if not proj:
            return None
            
    project_id = proj.project_id
        
    risk = db.query(Risk).filter(Risk.project_id == project_id).first()
    agency = db.query(Agency).filter(Agency.agency_id == proj.agency_id).first()
    location = db.query(Location).filter(Location.location_id == proj.location_id).first()
    inv = db.query(Investigation).filter(Investigation.project_id == project_id).first()
    evidence_list = db.query(Evidence).filter(Evidence.project_id == project_id).all()
    
    risk_detail = None
    if risk:
        risk_detail = RiskDetail(
            priority_score=risk.priority_score,
            financial_risk=risk.financial_risk,
            timeline_risk=risk.timeline_risk,
            agency_risk=risk.agency_risk,
            geographic_risk=risk.geographic_risk,
            similarity_risk=risk.similarity_risk,
            is_anomaly=risk.is_anomaly,
            financial_explanation=risk.financial_explanation or "",
            timeline_explanation=risk.timeline_explanation or "",
            agency_explanation=risk.agency_explanation or "",
            geographic_explanation=risk.geographic_explanation or "",
            similarity_explanation=risk.similarity_explanation or "",
            overall_explanation=risk.overall_explanation or "",
            recommended_verification=risk.recommended_verification or []
        )
        
    inv_detail = None
    if inv:
        inv_detail = InvestigationDetail(
            investigation_id=inv.investigation_id,
            project_id=inv.project_id,
            investigator=inv.investigator,
            status=inv.status,
            notes=inv.notes or "",
            findings=inv.findings or [],
            created_at=inv.created_at,
            updated_at=inv.updated_at
        )
        
    evidence_items = [
        EvidenceItem(
            evidence_id=e.evidence_id,
            project_id=e.project_id,
            title=e.title,
            source=e.source,
            evidence_type=e.evidence_type,
            content=e.content,
            relevance=e.relevance,
            created_at=e.created_at
        )
        for e in evidence_list
    ]
    
    return ProjectDetail(
        project_id=proj.project_id,
        project_name=proj.project_name,
        description=proj.description,
        work_type=proj.work_type,
        status=proj.status,
        constituency=proj.constituency,
        district=proj.district,
        agency_id=proj.agency_id,
        agency_name=agency.agency_name if agency else None,
        location_id=proj.location_id,
        block_name=location.block_name if location else None,
        gram_panchayat_or_ward=location.gram_panchayat_or_ward if location else None,
        sanctioned_amount=proj.sanctioned_amount,
        released_amount=proj.released_amount,
        expenditure=proj.expenditure,
        sanction_date=proj.sanction_date,
        start_date=proj.start_date,
        expected_completion_date=proj.expected_completion_date,
        actual_completion_date=proj.actual_completion_date,
        latitude=proj.latitude,
        longitude=proj.longitude,
        priority_score=risk.priority_score if risk else 0.0,
        is_anomaly=risk.is_anomaly if risk else False,
        investigation_status=inv.status if inv else "NEW",
        data_source_label=proj.data_source_label,
        risk=risk_detail,
        investigation=inv_detail,
        evidence_items=evidence_items
    )

def update_investigation(db: Session, project_id: str, req: InvestigationUpdate) -> Optional[InvestigationDetail]:
    inv = db.query(Investigation).filter(Investigation.project_id == project_id).first()
    if not inv:
        inv = Investigation(
            project_id=project_id,
            investigator="R. K. Verma (Senior Vigilance Officer)",
            status=req.status,
            notes=req.notes or "",
            findings=req.findings or []
        )
        db.add(inv)
    else:
        inv.status = req.status
        if req.notes is not None:
            inv.notes = req.notes
        if req.findings is not None:
            inv.findings = req.findings
            
    db.commit()
    db.refresh(inv)
    return InvestigationDetail(
        investigation_id=inv.investigation_id,
        project_id=inv.project_id,
        investigator=inv.investigator,
        status=inv.status,
        notes=inv.notes or "",
        findings=inv.findings or [],
        created_at=inv.created_at,
        updated_at=inv.updated_at
    )

def get_dashboard_stats(db: Session, constituency: Optional[str] = None) -> DashboardStats:
    if constituency and constituency.lower() not in ["all_india", "all", "national"]:
        seed_constituency_if_needed(db, constituency)
        token = constituency.lower().replace('-', '_').replace(' ', '_').split('_')[0]
        projects = db.query(Project).filter(Project.constituency.ilike(f"%{token}%")).all()
        constituency_title = projects[0].constituency if projects else f"{constituency.replace('_', ' ').title()} Lok Sabha Constituency"
    else:
        projects = db.query(Project).all()
        constituency_title = "All India (All 543 Constituencies)"

    proj_ids = [p.project_id for p in projects]
    total_projects = len(projects)
    
    if proj_ids:
        risks = db.query(Risk).filter(Risk.project_id.in_(proj_ids)).all()
        invs = db.query(Investigation).filter(Investigation.project_id.in_(proj_ids)).all()
        agency_ids = list(set(p.agency_id for p in projects))
        agencies_count = len(agency_ids)
    else:
        risks = []
        invs = []
        agencies_count = 0
    
    high_count = sum(1 for r in risks if r.priority_score >= 75.0)
    med_count = sum(1 for r in risks if 45.0 <= r.priority_score < 75.0)
    low_count = sum(1 for r in risks if r.priority_score < 45.0)
    avg_priority = (sum(r.priority_score for r in risks) / len(risks)) if risks else 0.0
    
    under_inv = sum(1 for i in invs if i.status == "UNDER REVIEW" or i.status == "ESCALATED")
    resolved = sum(1 for i in invs if i.status == "VERIFIED" or i.status == "DISMISSED")
    
    total_sanc = sum(p.sanctioned_amount for p in projects)
    total_exp = sum(p.expenditure for p in projects)
    
    # Distributions
    risk_dist = {
        "High Priority (>=75)": high_count,
        "Medium Priority (45-74)": med_count,
        "Low Priority (<45)": low_count
    }
    
    work_dist = {}
    for p in projects:
        work_dist[p.work_type] = work_dist.get(p.work_type, 0) + 1
        
    top_projects = get_projects(db, constituency=constituency, sort_by="priority_score", sort_order="desc", limit=5)
    
    recent_inv_list = []
    for i in invs[:8]:
        p = db.query(Project).filter(Project.project_id == i.project_id).first()
        r = db.query(Risk).filter(Risk.project_id == i.project_id).first()
        if p and r:
            recent_inv_list.append({
                "project_id": p.project_id,
                "project_name": p.project_name,
                "work_type": p.work_type,
                "priority_score": r.priority_score,
                "status": i.status,
                "notes": i.notes,
                "updated_at": i.updated_at.isoformat() if i.updated_at else ""
            })
            
    return DashboardStats(
        constituency=constituency_title,
        total_projects=total_projects,
        high_priority_count=high_count,
        medium_priority_count=med_count,
        low_priority_count=low_count,
        under_investigation_count=under_inv,
        resolved_count=resolved,
        total_sanctioned_amount=round(total_sanc, 2),
        total_expenditure=round(total_exp, 2),
        total_agencies=agencies_count,
        average_priority_score=round(avg_priority, 1),
        risk_distribution=risk_dist,
        work_type_distribution=work_dist,
        top_priority_projects=top_projects,
        recent_investigations=recent_inv_list
    )
