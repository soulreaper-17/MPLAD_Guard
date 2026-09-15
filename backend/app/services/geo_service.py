from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.schema import Project, Risk, Agency, Location
from backend.pipeline.feature_engineering import haversine_distance

def get_map_projects(
    db: Session,
    min_priority: Optional[float] = None,
    work_type: Optional[str] = None,
    agency_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    query = db.query(Project, Risk, Agency, Location).join(
        Risk, Project.project_id == Risk.project_id
    ).join(
        Agency, Project.agency_id == Agency.agency_id
    ).outerjoin(
        Location, Project.location_id == Location.location_id
    )
    
    if min_priority is not None:
        query = query.filter(Risk.priority_score >= min_priority)
    if work_type and work_type != "ALL":
        query = query.filter(Project.work_type == work_type)
    if agency_id and agency_id != "ALL":
        query = query.filter(Project.agency_id == agency_id)
        
    results = query.all()
    
    markers = []
    for p, r, agy, loc in results:
        markers.append({
            "project_id": p.project_id,
            "project_name": p.project_name,
            "work_type": p.work_type,
            "status": p.status,
            "agency_id": p.agency_id,
            "agency_name": agy.agency_name if agy else "Unknown",
            "block_name": loc.block_name if loc else "Nalanda",
            "ward": loc.gram_panchayat_or_ward if loc else "",
            "sanctioned_amount": p.sanctioned_amount,
            "expenditure": p.expenditure,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "priority_score": r.priority_score if r else 0.0,
            "is_anomaly": r.is_anomaly if r else False,
            "geographic_risk": r.geographic_risk if r else 0.0
        })
    return markers

def get_nearby_projects(
    db: Session,
    project_id: str,
    radius_km: float = 3.0
) -> Dict[str, Any]:
    subj = db.query(Project).filter(Project.project_id == project_id).first()
    if not subj:
        return {"project_id": project_id, "nearby": []}
        
    all_projs = db.query(Project, Risk, Agency).join(
        Risk, Project.project_id == Risk.project_id
    ).join(
        Agency, Project.agency_id == Agency.agency_id
    ).all()
    
    nearby_list = []
    for p, r, agy in all_projs:
        if p.project_id == subj.project_id:
            continue
        dist = haversine_distance(subj.latitude, subj.longitude, p.latitude, p.longitude)
        if dist <= radius_km:
            nearby_list.append({
                "project_id": p.project_id,
                "project_name": p.project_name,
                "work_type": p.work_type,
                "agency_name": agy.agency_name,
                "distance_km": round(dist, 3),
                "distance_meters": int(dist * 1000),
                "sanctioned_amount": p.sanctioned_amount,
                "priority_score": r.priority_score,
                "is_same_work_type": (p.work_type == subj.work_type),
                "latitude": p.latitude,
                "longitude": p.longitude
            })
            
    nearby_list = sorted(nearby_list, key=lambda x: x["distance_km"])
    return {
        "project_id": project_id,
        "subject_latitude": subj.latitude,
        "subject_longitude": subj.longitude,
        "radius_km": radius_km,
        "count": len(nearby_list),
        "nearby": nearby_list
    }
