"""
Bulk Pre-seeding Pipeline for all 543 Lok Sabha Constituencies of India.
Generates at least 10-15 realistic, feature-engineered, risk-scored projects for EVERY single constituency.
"""
import os
import sys
import json
import time
from datetime import datetime
import pandas as pd

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from sqlalchemy.orm import Session
from backend.app.database import engine, Base, SessionLocal
from backend.app.models.schema import Project, Agency, Location, Risk, Investigation, RelationshipLink
from backend.pipeline.generate_demo_data import generate_projects_dataset, generate_projects_dataset_for_constituency
from backend.pipeline.feature_engineering import engineer_features
from backend.pipeline.ml_anomaly import run_anomaly_models
from backend.pipeline.risk_calculator import compute_risk_dimensions


import re

def get_all_constituency_keys():
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/src/lib/constituenciesData.ts"))
    if os.path.exists(data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            content = f.read()
            match = re.search(r'ALL_543_CONSTITUENCIES: Constituency\[\] = (\[[\s\S]*?\]);', content)
            if match:
                return json.loads(match.group(1))
    return []

def seed_all_543_constituencies():
    t0 = time.time()
    print("==================================================================")
    print("SEVAARTH AI - PAN-INDIA BULK SEEDING PIPELINE FOR ALL 543 SEATS")
    print("==================================================================")

    # Reset database tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. First seed Nalanda golden demo dataset
        print("\n[1/3] Generating Nalanda Golden Demo dataset...")
        nalanda_df = generate_projects_dataset(75)
        
        all_dfs = [nalanda_df]
        
        # 2. Get list of all 543 constituencies
        constituencies = get_all_constituency_keys()
        print(f"\n[2/3] Generating datasets for all {len(constituencies)} Lok Sabha Constituencies...")
        
        for idx, c in enumerate(constituencies, 1):
            cid = c["id"]
            if cid == "nalanda":
                continue # Already added
                
            c_df = generate_projects_dataset_for_constituency(cid, num_records=10)
            all_dfs.append(c_df)
            if idx % 50 == 0 or idx == len(constituencies):
                print(f"  Processed {idx}/{len(constituencies)} constituencies ({c['name']})...")
                
        # Combine all project DataFrames
        combined_raw_df = pd.concat(all_dfs, ignore_index=True).drop_duplicates(subset=["project_id"]).reset_index(drop=True)
        print(f"\nTotal raw projects generated across India: {len(combined_raw_df)}")

        # 3. Feature engineering & ML scoring
        print("\n[3/3] Running Feature Engineering, ML Anomaly Screening & Risk Calculation...")
        feat_df, agency_stats, category_stats = engineer_features(combined_raw_df)
        ml_df = run_anomaly_models(feat_df)

        # Batch Insert Agencies
        print("Saving Agencies to Database...")
        agency_objs = []
        for agy_id, stats in agency_stats.items():
            sample_rows = ml_df[ml_df["agency_id"] == agy_id]
            if sample_rows.empty:
                continue
            sample_row = sample_rows.iloc[0]
            agency_objs.append(Agency(
                agency_id=agy_id,
                agency_name=sample_row["agency_name"],
                agency_type=sample_row["agency_type"],
                district=str(sample_row["district"]),
                state=str(sample_row["state"]),
                project_count=stats["project_count"],
                completed_count=stats["completed_count"],
                delayed_count=stats["delayed_count"],
                completion_rate=round(stats["completion_rate"], 3),
                delay_rate=round(stats["delay_rate"], 3),
                average_cost=round(stats["average_cost"], 2),
                average_delay=round(stats["average_delay"], 1),
                risk_profile_level=stats["risk_profile_level"]
            ))
        db.bulk_save_objects(agency_objs)
        db.commit()

        # Batch Insert Locations
        print("Saving Locations to Database...")
        inserted_locations = set()
        location_objs = []
        for idx, row in ml_df.iterrows():
            loc_id = row["location_id"]
            if loc_id not in inserted_locations:
                location_objs.append(Location(
                    location_id=loc_id,
                    block_name=str(row["block_name"]),
                    gram_panchayat_or_ward=str(row["gram_panchayat_or_ward"]),
                    assembly_constituency=str(row["assembly_constituency"]),
                    parliamentary_constituency=str(row["constituency"]),
                    district=str(row["district"]),
                    state=str(row["state"]),
                    latitude=float(row["latitude"]),
                    longitude=float(row["longitude"])
                ))
                inserted_locations.add(loc_id)
        db.bulk_save_objects(location_objs)
        db.commit()

        # Batch Insert Projects, Risks, and Investigations
        print("Saving Projects, Risk Dimensions & Investigations to Database...")
        project_objs = []
        risk_objs = []
        inv_objs = []

        def clean_dt(val):
            if pd.isna(val) or val is None:
                return None
            if isinstance(val, pd.Timestamp):
                return val.to_pydatetime()
            return val

        for idx, row in ml_df.iterrows():
            p_obj = Project(
                project_id=row["project_id"],
                project_name=row["project_name"],
                description=row["description"],
                work_type=row["work_type"],
                status=row["status"],
                constituency=row["constituency"],
                district=row["district"],
                state=row["state"],
                agency_id=row["agency_id"],
                location_id=row["location_id"],
                sanctioned_amount=float(row["sanctioned_amount"]),
                released_amount=float(row["released_amount"]),
                expenditure=float(row["expenditure"]),
                sanction_date=clean_dt(row["sanction_date"]),
                start_date=clean_dt(row["start_date"]),
                expected_completion_date=clean_dt(row["expected_completion_date"]),
                actual_completion_date=clean_dt(row["actual_completion_date"]),
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                data_source_label=str(row["data_source_label"])
            )
            project_objs.append(p_obj)

            risk_dict = compute_risk_dimensions(row)
            p_score = risk_dict["priority_score"]
            r_obj = Risk(
                project_id=row["project_id"],
                priority_score=p_score,
                financial_risk=risk_dict["financial_risk"],
                timeline_risk=risk_dict["timeline_risk"],
                agency_risk=risk_dict["agency_risk"],
                geographic_risk=risk_dict["geographic_risk"],
                similarity_risk=risk_dict["similarity_risk"],
                is_anomaly=bool(row.get("is_anomaly", p_score >= 70)),
                financial_explanation=risk_dict["financial_explanation"],
                timeline_explanation=risk_dict["timeline_explanation"],
                agency_explanation=risk_dict["agency_explanation"],
                geographic_explanation=risk_dict["geographic_explanation"],
                similarity_explanation=risk_dict["similarity_explanation"],
                overall_explanation=risk_dict["overall_explanation"],
                recommended_verification=risk_dict["recommended_verification"]
            )
            risk_objs.append(r_obj)

            inv_status = "UNDER REVIEW" if p_score >= 75 else ("NEW" if p_score >= 50 else "VERIFIED")
            inv_obj = Investigation(
                project_id=row["project_id"],
                investigator="R. K. Verma (Senior Vigilance Officer)",
                status=inv_status,
                notes=f"Vigilance screening initiated for {row['project_name']} in {row['constituency']}.",
                findings=[risk_dict["overall_explanation"]]
            )
            inv_objs.append(inv_obj)

        db.bulk_save_objects(project_objs)
        db.bulk_save_objects(risk_objs)
        db.bulk_save_objects(inv_objs)
        db.commit()

        t1 = time.time()
        print("\n==================================================================")
        print("PAN-INDIA PRE-SEEDING COMPLETE!")
        print(f"Total Constituencies Processed: {len(constituencies)}")
        print(f"Total Projects Pre-seeded: {len(ml_df)}")
        print(f"Total Agencies Pre-seeded: {len(agency_objs)}")
        print(f"Time Taken: {t1 - t0:.2f} seconds")
        print("==================================================================")

    except Exception as e:
        db.rollback()
        print(f"Error during bulk seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_543_constituencies()
