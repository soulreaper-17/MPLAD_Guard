from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Agency(Base):
    __tablename__ = "agencies"

    agency_id = Column(String(64), primary_key=True, index=True)
    agency_name = Column(String(255), nullable=False, index=True)
    agency_type = Column(String(100), default="Government Executing Agency")
    district = Column(String(100), default="Nalanda")
    state = Column(String(100), default="Bihar")
    
    # Aggregated profile stats
    project_count = Column(Integer, default=0)
    completed_count = Column(Integer, default=0)
    delayed_count = Column(Integer, default=0)
    completion_rate = Column(Float, default=0.0)
    delay_rate = Column(Float, default=0.0)
    average_cost = Column(Float, default=0.0)
    average_delay = Column(Float, default=0.0)
    risk_profile_level = Column(String(32), default="NORMAL") # LOW, ELEVATED, HIGH

    projects = relationship("Project", back_populates="agency")


class Location(Base):
    __tablename__ = "locations"

    location_id = Column(String(64), primary_key=True, index=True)
    block_name = Column(String(100), index=True)
    gram_panchayat_or_ward = Column(String(100))
    assembly_constituency = Column(String(100))
    parliamentary_constituency = Column(String(100), default="Nalanda")
    district = Column(String(100), default="Nalanda")
    state = Column(String(100), default="Bihar")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    projects = relationship("Project", back_populates="location")


class Project(Base):
    __tablename__ = "projects"

    project_id = Column(String(64), primary_key=True, index=True)
    project_name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    work_type = Column(String(100), nullable=False, index=True)
    status = Column(String(64), default="Ongoing", index=True) # Ongoing, Completed, Sanctioned, Delayed
    
    constituency = Column(String(100), default="Nalanda", index=True)
    district = Column(String(100), default="Nalanda")
    state = Column(String(100), default="Bihar")
    
    agency_id = Column(String(64), ForeignKey("agencies.agency_id"), nullable=False, index=True)
    location_id = Column(String(64), ForeignKey("locations.location_id"), nullable=False, index=True)
    
    # Financial fields (in INR Lakhs)
    sanctioned_amount = Column(Float, nullable=False)
    released_amount = Column(Float, nullable=False)
    expenditure = Column(Float, nullable=False)
    
    # Dates
    sanction_date = Column(DateTime, nullable=False)
    start_date = Column(DateTime, nullable=True)
    expected_completion_date = Column(DateTime, nullable=True)
    actual_completion_date = Column(DateTime, nullable=True)
    
    # Geo
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Data Tag
    data_source_label = Column(String(64), default="SIH Prototype / Demo Dataset")

    # Relationships
    agency = relationship("Agency", back_populates="projects")
    location = relationship("Location", back_populates="projects")
    risk = relationship("Risk", back_populates="project", uselist=False, cascade="all, delete-orphan")
    investigation = relationship("Investigation", back_populates="project", uselist=False, cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="project", cascade="all, delete-orphan")


class Risk(Base):
    __tablename__ = "risks"

    risk_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), ForeignKey("projects.project_id"), unique=True, nullable=False, index=True)
    
    # 0-100 Decomposable Risk Dimensions
    priority_score = Column(Float, nullable=False, index=True)
    financial_risk = Column(Float, nullable=False)
    timeline_risk = Column(Float, nullable=False)
    agency_risk = Column(Float, nullable=False)
    geographic_risk = Column(Float, nullable=False)
    similarity_risk = Column(Float, nullable=False)
    
    # Isolation Forest & Statistical Features
    isolation_forest_anomaly_score = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    
    # Breakdown explanations
    financial_explanation = Column(Text)
    timeline_explanation = Column(Text)
    agency_explanation = Column(Text)
    geographic_explanation = Column(Text)
    similarity_explanation = Column(Text)
    overall_explanation = Column(Text)
    recommended_verification = Column(JSON) # List of action bullets

    project = relationship("Project", back_populates="risk")


class Investigation(Base):
    __tablename__ = "investigations"

    investigation_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), ForeignKey("projects.project_id"), unique=True, nullable=False, index=True)
    investigator = Column(String(100), default="R. K. Verma")
    status = Column(String(32), default="NEW", index=True) # NEW, UNDER REVIEW, VERIFIED, DISMISSED, ESCALATED
    notes = Column(Text, default="")
    findings = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="investigation")


class Evidence(Base):
    __tablename__ = "evidence"

    evidence_id = Column(String(64), primary_key=True, index=True)
    project_id = Column(String(64), ForeignKey("projects.project_id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source = Column(String(100), nullable=False) # e.g. "MPLADS Portal Ingestion", "CAG Audit Benchmark", "Geographic Proximity Engine"
    evidence_type = Column(String(64), nullable=False) # FINANCIAL, TIMELINE, AGENCY_LOG, SPATIAL, SIMILARITY_TEXT, GUIDELINE_REF
    content = Column(Text, nullable=False)
    relevance = Column(String(32), default="HIGH") # HIGH, MEDIUM, CONTEXTUAL
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="evidence_items")


class RelationshipLink(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(64), nullable=False, index=True)
    source_type = Column(String(32), nullable=False) # PROJECT, AGENCY, LOCATION, SIMILAR_WORK
    target_id = Column(String(64), nullable=False, index=True)
    target_type = Column(String(32), nullable=False)
    relationship_type = Column(String(64), nullable=False) # IMPLEMENTED_BY, LOCATED_AT, PEER_SIMILAR_TO, PROXIMITY_OVERLAP, AGENCY_SHARED
    weight = Column(Float, default=1.0)
    details = Column(JSON, default=dict)


class PublicReport(Base):
    __tablename__ = "public_reports"

    report_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), ForeignKey("projects.project_id"), nullable=False, index=True)
    user_email = Column(String(120), nullable=False, index=True)
    user_name = Column(String(120), default="Public Citizen")
    complaint_text = Column(Text, nullable=False)
    ai_critical_points = Column(JSON, default=list)
    ai_urgency = Column(String(32), default="MEDIUM") # HIGH, MEDIUM, LOW
    status = Column(String(32), default="PENDING") # PENDING, REVIEWED, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project")

