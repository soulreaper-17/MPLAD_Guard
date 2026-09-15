from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.api_models import AssistantQuestionRequest, AssistantAnswerResponse
from backend.app.services.rag_service import ask_investigation_assistant

router = APIRouter(prefix="/assistant", tags=["AI Investigation Assistant"])

@router.post("/ask", response_model=AssistantAnswerResponse)
def ask_assistant(req: AssistantQuestionRequest, db: Session = Depends(get_db)):
    return ask_investigation_assistant(db, req)
