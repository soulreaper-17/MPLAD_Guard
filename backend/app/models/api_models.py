from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class SendOtpRequest(BaseModel):
    phone_number: str

class VerifyOtpRequest(BaseModel):
    phone_number: str
    otp: str

class SendOtpResponse(BaseModel):
    success: bool
    masked_phone: str
    message: str
    expires_in: int = 300
    dev_otp: Optional[str] = None

class SendEmailOtpRequest(BaseModel):
    email: str

class SendEmailOtpResponse(BaseModel):
    success: bool
    masked_email: str
    message: str
    expires_in: int = 300
    dev_otp: Optional[str] = None

class VerifyEmailOtpRequest(BaseModel):
    email: str
    otp: str

class VerifyEmailOtpResponse(BaseModel):
    success: bool
    verification_token: str
    message: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    role: Optional[str] = "Vigilance Investigator"
    agency: Optional[str] = "District Vigilance Bureau"
    state: Optional[str] = "BIHAR"
    verification_token: Optional[str] = None

class UserProfile(BaseModel):
    email: str
    name: str
    role: str = "Investigator"
    agency: str = "Vigilance & Monitoring Directorate"
    token: str
    phone: Optional[str] = None

# Risk Schemas
class RiskDetail(BaseModel):
    priority_score: float
    financial_risk: float
    timeline_risk: float
    agency_risk: float
    geographic_risk: float
    similarity_risk: float
    is_anomaly: bool = False
    financial_explanation: str
    timeline_explanation: str
    agency_explanation: str
    geographic_explanation: str
    similarity_explanation: str
    overall_explanation: str
    recommended_verification: List[str]

# Evidence Schema
class EvidenceItem(BaseModel):
    evidence_id: str
    project_id: str
    title: str
    source: str
    evidence_type: str
    content: str
    relevance: str
    created_at: Optional[datetime] = None

# Investigation Schema
class InvestigationUpdate(BaseModel):
    status: str # NEW, UNDER REVIEW, VERIFIED, DISMISSED, ESCALATED
    notes: Optional[str] = None
    findings: Optional[List[str]] = None

class InvestigationDetail(BaseModel):
    investigation_id: int
    project_id: str
    investigator: str
    status: str
    notes: str
    findings: List[str]
    created_at: datetime
    updated_at: datetime

# Project Schemas
class ProjectSummary(BaseModel):
    project_id: str
    project_name: str
    work_type: str
    status: str
    constituency: str
    district: str
    agency_id: str
    agency_name: Optional[str] = None
    sanctioned_amount: float
    released_amount: float
    expenditure: float
    sanction_date: datetime
    start_date: Optional[datetime] = None
    expected_completion_date: Optional[datetime] = None
    actual_completion_date: Optional[datetime] = None
    latitude: float
    longitude: float
    priority_score: float
    is_anomaly: bool = False
    investigation_status: str = "NEW"

class ProjectDetail(ProjectSummary):
    description: str
    location_id: str
    block_name: Optional[str] = None
    gram_panchayat_or_ward: Optional[str] = None
    data_source_label: str = "SIH Prototype / Demo Dataset"
    risk: Optional[RiskDetail] = None
    investigation: Optional[InvestigationDetail] = None
    evidence_items: List[EvidenceItem] = []

# Peer Comparison Schemas
class PeerMetric(BaseModel):
    project_id: str
    project_name: str
    agency_name: str
    work_type: str
    sanctioned_amount: float
    expenditure: float
    duration_days: int
    delay_days: int
    cost_per_km_or_unit: Optional[float] = None
    status: str
    similarity_score: float
    is_subject: bool = False

class PeerComparisonResponse(BaseModel):
    subject_project_id: str
    peer_group_name: str
    selection_rationale: str
    peer_count: int
    benchmarks: Dict[str, Any]
    peers: List[PeerMetric]

# Agency Profile Schemas
class AgencySummary(BaseModel):
    agency_id: str
    agency_name: str
    agency_type: str
    district: str
    state: str
    project_count: int
    completed_count: int
    delayed_count: int
    completion_rate: float
    delay_rate: float
    average_cost: float
    average_delay: float
    risk_profile_level: str

class AgencyDetail(AgencySummary):
    work_type_distribution: Dict[str, int]
    associated_projects: List[ProjectSummary]
    historical_risk_signals: List[str]

# Graph Schemas
class GraphNode(BaseModel):
    id: str
    label: str
    type: str # project, agency, location, peer, duplicate
    data: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    type: str # implemented_by, located_at, similar_to, proximity_overlap, agency_shared
    weight: float = 1.0

class GraphResponse(BaseModel):
    project_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# AI Assistant Schemas
class AssistantQuestionRequest(BaseModel):
    project_id: Optional[str] = None
    question: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class AssistantAnswerResponse(BaseModel):
    answer: str
    evidence_citations: List[Dict[str, Any]]
    confidence: str
    mode: str # "RAG-GROUNDED" or "DEMO-SYNTHESIZER"
    timestamp: datetime = datetime.utcnow()

# Dashboard Schemas
class DashboardStats(BaseModel):
    constituency: str
    total_projects: int
    high_priority_count: int # score >= 75
    medium_priority_count: int # 45 <= score < 75
    low_priority_count: int # score < 45
    under_investigation_count: int
    resolved_count: int
    total_sanctioned_amount: float
    total_expenditure: float
    total_agencies: int
    average_priority_score: float
    risk_distribution: Dict[str, int]
    work_type_distribution: Dict[str, int]
    top_priority_projects: List[ProjectSummary]
    recent_investigations: List[Dict[str, Any]]

# Public Report Schemas
class PublicReportCreateRequest(BaseModel):
    user_email: Optional[str] = "citizen@mpladguard.gov.in"
    user_name: Optional[str] = "Public Citizen"
    complaint_text: str

class PublicReportItem(BaseModel):
    report_id: int
    project_id: str
    user_email: str
    user_name: str
    complaint_text: str
    ai_critical_points: List[str]
    ai_urgency: str
    status: str
    created_at: str

class PublicReportListResponse(BaseModel):
    project_id: str
    total_reports_count: int
    max_capacity: int = 1000
    user_can_submit_today: bool = True
    reports: List[PublicReportItem]

