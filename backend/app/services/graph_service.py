from typing import Dict, Any, List, Optional
import networkx as nx
from sqlalchemy.orm import Session
from backend.app.models.schema import Project, Agency, Location, Risk, RelationshipLink
from backend.app.models.api_models import GraphResponse, GraphNode, GraphEdge

def build_project_graph(db: Session, project_id: str, depth: int = 2) -> GraphResponse:
    G = nx.MultiDiGraph()
    
    # 1. Fetch subject project
    subj = db.query(Project).filter(Project.project_id == project_id).first()
    if not subj:
        return GraphResponse(project_id=project_id, nodes=[], edges=[])
        
    subj_risk = db.query(Risk).filter(Risk.project_id == project_id).first()
    subj_agency = db.query(Agency).filter(Agency.agency_id == subj.agency_id).first()
    subj_loc = db.query(Location).filter(Location.location_id == subj.location_id).first()
    
    # Add Subject Node
    G.add_node(
        subj.project_id,
        label=f"Project: {subj.project_id}",
        type="subject_project",
        data={
            "name": subj.project_name,
            "work_type": subj.work_type,
            "cost": f"₹{subj.sanctioned_amount:.2f}L",
            "priority": subj_risk.priority_score if subj_risk else 0.0,
            "status": subj.status
        }
    )
    
    # Add Agency Node & Edge
    if subj_agency:
        G.add_node(
            subj_agency.agency_id,
            label=f"Agency: {subj_agency.agency_name[:24]}...",
            type="agency",
            data={
                "name": subj_agency.agency_name,
                "type": subj_agency.agency_type,
                "delay_rate": f"{subj_agency.delay_rate*100:.0f}%",
                "risk_level": subj_agency.risk_profile_level
            }
        )
        G.add_edge(
            subj.project_id,
            subj_agency.agency_id,
            id=f"e_{subj.project_id}_{subj_agency.agency_id}",
            label="IMPLEMENTED_BY",
            type="implemented_by",
            weight=1.0
        )
        
    # Add Location Node & Edge
    if subj_loc:
        loc_label = f"Loc: {subj_loc.block_name} ({subj_loc.gram_panchayat_or_ward})"
        G.add_node(
            subj_loc.location_id,
            label=loc_label,
            type="location",
            data={
                "block": subj_loc.block_name,
                "ward": subj_loc.gram_panchayat_or_ward,
                "constituency": subj_loc.parliamentary_constituency
            }
        )
        G.add_edge(
            subj.project_id,
            subj_loc.location_id,
            id=f"e_{subj.project_id}_{subj_loc.location_id}",
            label="LOCATED_AT",
            type="located_at",
            weight=1.0
        )
        
    # Fetch direct relationship links from DB
    links = db.query(RelationshipLink).filter(
        (RelationshipLink.source_id == project_id) | (RelationshipLink.target_id == project_id)
    ).all()
    
    for l in links:
        other_id = l.target_id if l.source_id == project_id else l.source_id
        
        # If connecting to another project
        other_proj = db.query(Project).filter(Project.project_id == other_id).first()
        if other_proj:
            other_risk = db.query(Risk).filter(Risk.project_id == other_id).first()
            p_type = "overlapping_project" if l.relationship_type == "PROXIMITY_OVERLAP" else "similar_project"
            
            G.add_node(
                other_proj.project_id,
                label=f"Peer: {other_proj.project_id}",
                type=p_type,
                data={
                    "name": other_proj.project_name,
                    "work_type": other_proj.work_type,
                    "cost": f"₹{other_proj.sanctioned_amount:.2f}L",
                    "priority": other_risk.priority_score if other_risk else 0.0,
                    "status": other_proj.status,
                    "overlap_info": l.details
                }
            )
            G.add_edge(
                l.source_id,
                l.target_id,
                id=f"e_{l.source_id}_{l.target_id}_{l.relationship_type}",
                label=l.relationship_type.replace("_", " "),
                type=l.relationship_type.lower(),
                weight=float(l.weight)
            )
            
    # Include 2-3 sibling projects executed by the same agency to show Agency Cluster
    if subj_agency:
        sibling_projects = db.query(Project).filter(
            Project.agency_id == subj_agency.agency_id,
            Project.project_id != subj.project_id
        ).limit(3).all()
        
        for sib in sibling_projects:
            sib_risk = db.query(Risk).filter(Risk.project_id == sib.project_id).first()
            G.add_node(
                sib.project_id,
                label=f"Agency Work: {sib.project_id}",
                type="agency_sibling",
                data={
                    "name": sib.project_name,
                    "work_type": sib.work_type,
                    "cost": f"₹{sib.sanctioned_amount:.2f}L",
                    "priority": sib_risk.priority_score if sib_risk else 0.0,
                    "status": sib.status
                }
            )
            G.add_edge(
                sib.project_id,
                subj_agency.agency_id,
                id=f"e_{sib.project_id}_{subj_agency.agency_id}",
                label="EXECUTED_BY",
                type="implemented_by",
                weight=0.8
            )

    # Format into Pydantic models for Cytoscape.js
    nodes: List[GraphNode] = []
    for n_id, attrs in G.nodes(data=True):
        nodes.append(GraphNode(
            id=n_id,
            label=attrs.get("label", n_id),
            type=attrs.get("type", "default"),
            data=attrs.get("data", {})
        ))
        
    edges: List[GraphEdge] = []
    for u, v, attrs in G.edges(data=True):
        edges.append(GraphEdge(
            id=attrs.get("id", f"e_{u}_{v}"),
            source=u,
            target=v,
            label=attrs.get("label", "CONNECTED"),
            type=attrs.get("type", "connected"),
            weight=float(attrs.get("weight", 1.0))
        ))
        
    return GraphResponse(
        project_id=project_id,
        nodes=nodes,
        edges=edges
    )
