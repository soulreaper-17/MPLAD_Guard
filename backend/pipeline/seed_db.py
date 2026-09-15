"""
Database Seeding Script for MPLAD-GUARD AI
Builds the complete database with realistic data, features, risk scores, evidence items, and relationships.
"""
import os
import sys
from datetime import datetime
import pandas as pd

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.database import engine, Base, SessionLocal
from backend.app.models.schema import Project, Agency, Location, Risk, Investigation, Evidence, RelationshipLink
from backend.pipeline.generate_demo_data import generate_projects_dataset
from backend.pipeline.feature_engineering import engineer_features
from backend.pipeline.ml_anomaly import run_anomaly_models
from backend.pipeline.risk_calculator import compute_risk_dimensions

def seed_database():
    print("==================================================")
    print("MPLAD-GUARD AI - INITIATING SEEDING PIPELINE")
    print("Constituency: Nalanda Lok Sabha Constituency, Bihar")
    print("==================================================")
    
    # 1. Reset/Create database tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # 2. Generate raw projects dataframe
        print("Step 1/6: Generating realistic project records...")
        raw_df = generate_projects_dataset(75)
        
        # 3. Feature engineering
        print("Step 2/6: Extracting Financial, Timeline, Agency, Geo, and Semantic features...")
        feat_df, agency_stats, category_stats = engineer_features(raw_df)
        
        # 4. ML Anomaly detection
        print("Step 3/6: Running Isolation Forest and statistical anomaly screening...")
        ml_df = run_anomaly_models(feat_df)
        
        # 5. Insert Agencies
        print("Step 4/6: Seeding Canonical Agencies...")
        for agy_id, stats in agency_stats.items():
            # Find sample row for agency metadata
            sample_row = ml_df[ml_df["agency_id"] == agy_id].iloc[0]
            agency_obj = Agency(
                agency_id=agy_id,
                agency_name=sample_row["agency_name"],
                agency_type=sample_row["agency_type"],
                district="Nalanda",
                state="Bihar",
                project_count=stats["project_count"],
                completed_count=stats["completed_count"],
                delayed_count=stats["delayed_count"],
                completion_rate=round(stats["completion_rate"], 3),
                delay_rate=round(stats["delay_rate"], 3),
                average_cost=round(stats["average_cost"], 2),
                average_delay=round(stats["average_delay"], 1),
                risk_profile_level=stats["risk_profile_level"]
            )
            db.merge(agency_obj)
        db.commit()
        
        # 6. Insert Locations & Projects & Risks & Investigations & Evidence
        print("Step 5/6: Seeding Projects, Risk Scores, and Evidence Dossiers...")
        inserted_locations = set()
        
        for idx, row in ml_df.iterrows():
            loc_id = row["location_id"]
            if loc_id not in inserted_locations:
                loc_obj = Location(
                    location_id=loc_id,
                    block_name=str(row["block_name"]),
                    gram_panchayat_or_ward=str(row["gram_panchayat_or_ward"]),
                    assembly_constituency=str(row["assembly_constituency"]),
                    parliamentary_constituency="Nalanda",
                    district="Nalanda",
                    state="Bihar",
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"])
                )
                db.merge(loc_obj)
                inserted_locations.add(loc_id)
                
            def clean_dt(val):
                if pd.isna(val) or val is None:
                    return None
                if isinstance(val, pd.Timestamp):
                    return val.to_pydatetime()
                return val

            s_date = clean_dt(row["sanction_date"])
            st_date = clean_dt(row["start_date"])
            exp_date = clean_dt(row["expected_completion_date"])
            act_date = clean_dt(row["actual_completion_date"])
            
            # Create Project
            proj_obj = Project(
                project_id=str(row["project_id"]),
                project_name=str(row["project_name"]),
                description=str(row["description"]),
                work_type=str(row["work_type"]),
                status=str(row["status"]),
                constituency="Nalanda",
                district="Nalanda",
                state="Bihar",
                agency_id=str(row["agency_id"]),
                location_id=loc_id,
                sanctioned_amount=float(row["sanctioned_amount"]),
                released_amount=float(row["released_amount"]),
                expenditure=float(row["expenditure"]),
                sanction_date=s_date,
                start_date=st_date,
                expected_completion_date=exp_date,
                actual_completion_date=act_date,
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                data_source_label="SIH Prototype / Demo Dataset"
            )
            db.merge(proj_obj)
            
            # Compute Risk
            risk_dict = compute_risk_dimensions(row)
            risk_obj = Risk(
                project_id=str(row["project_id"]),
                priority_score=float(risk_dict["priority_score"]),
                financial_risk=float(risk_dict["financial_risk"]),
                timeline_risk=float(risk_dict["timeline_risk"]),
                agency_risk=float(risk_dict["agency_risk"]),
                geographic_risk=float(risk_dict["geographic_risk"]),
                similarity_risk=float(risk_dict["similarity_risk"]),
                isolation_forest_anomaly_score=float(row.get("isolation_forest_score", 0.0)),
                is_anomaly=bool(row.get("is_anomaly", False)),
                financial_explanation=str(risk_dict["financial_explanation"]),
                timeline_explanation=str(risk_dict["timeline_explanation"]),
                agency_explanation=str(risk_dict["agency_explanation"]),
                geographic_explanation=str(risk_dict["geographic_explanation"]),
                similarity_explanation=str(risk_dict["similarity_explanation"]),
                overall_explanation=str(risk_dict["overall_explanation"]),
                recommended_verification=list(risk_dict["recommended_verification"])
            )
            db.merge(risk_obj)
            
            # Investigation initial state
            inv_status = "NEW"
            inv_notes = ""
            if row["project_id"] == "MPLAD-NAL-2023-042":
                inv_status = "UNDER REVIEW"
                inv_notes = "Preliminary desk review initiated. Spatial proximity to 2021 road asset and 2.8x cost deviation flagged for urgent physical verification."
                
            inv_obj = Investigation(
                project_id=row["project_id"],
                investigator="R. K. Verma (Senior Vigilance Officer)",
                status=inv_status,
                notes=inv_notes,
                findings=["Initial signal triage completed."] if inv_notes else []
            )
            db.add(inv_obj)
            
            # Seed Evidence items
            # Generic Evidence 1: Financial Sanction Extract
            db.add(Evidence(
                evidence_id=f"EVD-FIN-{row['project_id']}",
                project_id=row["project_id"],
                title=f"Sanction & Fund Release Record: {row['project_id']}",
                source="MPLADS Official Portal / District Planning Office",
                evidence_type="FINANCIAL",
                content=(
                    f"Administrative Approval & Financial Sanction issued for ₹{row['sanctioned_amount']:.2f} Lakhs. "
                    f"Released Amount: ₹{row['released_amount']:.2f} Lakhs. Total Recorded Expenditure: ₹{row['expenditure']:.2f} Lakhs. "
                    f"Implementing Agency: {row['agency_name']}."
                ),
                relevance="HIGH"
            ))
            
            # Generic Evidence 2: Timeline & Execution Log
            db.add(Evidence(
                evidence_id=f"EVD-TIM-{row['project_id']}",
                project_id=row["project_id"],
                title=f"Milestone & Timeline Schedule: {row['project_id']}",
                source="District Monitoring & MIS System",
                evidence_type="TIMELINE",
                content=(
                    f"Sanction Date: {row['sanction_date'].strftime('%Y-%m-%d')}. "
                    f"Scheduled Completion: {row['expected_completion_date'].strftime('%Y-%m-%d') if pd.notnull(row['expected_completion_date']) else 'N/A'}. "
                    f"Actual/Status Date: {row['actual_completion_date'].strftime('%Y-%m-%d') if pd.notnull(row['actual_completion_date']) else 'Ongoing'}. "
                    f"Recorded Delay: {int(row.get('delay_days', 0))} days."
                ),
                relevance="HIGH"
            ))
            
            # Special Rich Evidence for Golden Case
            if row["project_id"] == "MPLAD-NAL-2023-042":
                db.add(Evidence(
                    evidence_id="EVD-GEO-042",
                    project_id="MPLAD-NAL-2023-042",
                    title="GIS Proximity Overlap Analysis with Asset MPLAD-NAL-2021-018",
                    source="Spatial Intelligence & PostGIS Proximity Engine",
                    evidence_type="SPATIAL",
                    content=(
                        "Spatial analysis detected that this project (lat: 25.1985, lon: 85.5180) is situated within 165 meters "
                        "of a previously completed PCC Road asset (MPLAD-NAL-2021-018) executed in Ward 12, Bihar Sharif in 2021. "
                        "Satellite alignment indicates co-terminus roadway stretch from Main Road to High School boundary."
                    ),
                    relevance="HIGH"
                ))
                db.add(Evidence(
                    evidence_id="EVD-AGY-042",
                    project_id="MPLAD-NAL-2023-042",
                    title="Agency Risk Fingerprint: Nalanda Nirman Samiti",
                    source="State Directorate of Vigilance / Agency Profile Log",
                    evidence_type="AGENCY_LOG",
                    content=(
                        "Nalanda Nirman Samiti has been assigned 5 MPLADS works in the constituency. "
                        "Historical delay rate stands at 80% with an average execution delay of 240 days. "
                        "Average project cost sanctioned through this agency is 185% above District Board median."
                    ),
                    relevance="HIGH"
                ))
                db.add(Evidence(
                    evidence_id="EVD-GUI-042",
                    project_id="MPLAD-NAL-2023-042",
                    title="MPLADS Guidelines 2023: Para 4.12 - Ban on Duplication of Works",
                    source="Ministry of Statistics and Programme Implementation (MoSPI) Norms",
                    evidence_type="GUIDELINE_REF",
                    content=(
                        "MoSPI Guidelines Para 4.12: 'No funds under MPLADS shall be sanctioned for a work in a location where a similar durable asset "
                        "has been created under any Central or State Scheme within the last 5 years, unless certified as fully dilapidated or non-functional by the District Authority.'"
                    ),
                    relevance="HIGH"
                ))
                db.add(Evidence(
                    evidence_id="EVD-MB-042",
                    project_id="MPLAD-NAL-2023-042",
                    title="Site Measurement Book (MB) & Itemized Estimate Notice",
                    source="District Audit Office / Field Verification Report",
                    evidence_type="FINANCIAL",
                    content=(
                        "Sanctioned Estimate includes ₹24.50L for excavation and PCC base layer, ₹28.00L for precast RCC drain covers, and ₹15.40L for bitumen sealant. "
                        "Standard Schedule of Rates (SOR) for identical stretch in Bihar Sharif specifies ₹22.80L total cost."
                    ),
                    relevance="HIGH"
                ))
                
        db.commit()
        
        # 7. Seed Graph Relationships
        print("Step 6/6: Building Cross-Entity Relationship Network...")
        # Project -> Agency (IMPLEMENTED_BY)
        for _, row in ml_df.iterrows():
            db.add(RelationshipLink(
                source_id=row["project_id"],
                source_type="PROJECT",
                target_id=row["agency_id"],
                target_type="AGENCY",
                relationship_type="IMPLEMENTED_BY",
                weight=1.0,
                details={"agency_name": row["agency_name"]}
            ))
            # Project -> Location (LOCATED_AT)
            db.add(RelationshipLink(
                source_id=row["project_id"],
                source_type="PROJECT",
                target_id=row["location_id"],
                target_type="LOCATION",
                relationship_type="LOCATED_AT",
                weight=1.0,
                details={"block": row["block_name"], "ward": row["gram_panchayat_or_ward"]}
            ))
            
            # Connect to most similar project if similarity > 0.65
            if row.get("max_semantic_similarity", 0) > 0.65 and row.get("most_similar_project_id") != "N/A":
                db.add(RelationshipLink(
                    source_id=row["project_id"],
                    source_type="PROJECT",
                    target_id=row["most_similar_project_id"],
                    target_type="PROJECT",
                    relationship_type="SEMANTICALLY_SIMILAR",
                    weight=float(row["max_semantic_similarity"]),
                    details={"similarity": float(row["max_semantic_similarity"])}
                ))
                
            # Connect spatial duplicates (< 350m)
            if row.get("spatial_overlap_flag", False) and row.get("min_dist_to_same_work_km", 99) < 0.35:
                # Find near project
                for _, near_row in ml_df.iterrows():
                    if near_row["project_id"] != row["project_id"] and near_row["work_type"] == row["work_type"]:
                        from backend.pipeline.feature_engineering import haversine_distance
                        d = haversine_distance(row["latitude"], row["longitude"], near_row["latitude"], near_row["longitude"])
                        if d < 0.35:
                            db.add(RelationshipLink(
                                source_id=row["project_id"],
                                source_type="PROJECT",
                                target_id=near_row["project_id"],
                                target_type="PROJECT",
                                relationship_type="PROXIMITY_OVERLAP",
                                weight=round(1.0 - (d / 0.35), 2),
                                details={"distance_meters": int(d * 1000)}
                            ))
                            break
                            
        db.commit()
        print("==================================================")
        print("SEEDING COMPLETE: Database successfully populated!")
        print(f"Total Projects: {len(ml_df)}")
        print(f"Total Agencies: {len(agency_stats)}")
        print("Golden Case ID: MPLAD-NAL-2023-042")
        print("==================================================")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
