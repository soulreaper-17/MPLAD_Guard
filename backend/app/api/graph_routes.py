from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.api_models import GraphResponse
from backend.app.services.graph_service import build_project_graph

router = APIRouter(prefix="/graph", tags=["Investigation Graph"])

@router.get("/project/{project_id}", response_model=GraphResponse)
def get_graph(
    project_id: str,
    depth: int = Query(2, ge=1, le=3),
    db: Session = Depends(get_db)
):
    graph_res = build_project_graph(db, project_id, depth=depth)
    if not graph_res.nodes:
        raise HTTPException(status_code=404, detail=f"Project {project_id} not found in graph")
    return graph_res
