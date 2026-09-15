"""
Explainable Risk Engine for MPLAD-GUARD AI
Computes 5 decomposed risk dimensions (0-100) and weighted Investigation Priority Score.
Generates human-readable, transparent reasoning and recommended verification checklist.
Workflow: Anomaly Screening -> Risk Decomposition -> Evidence Verification.
"""
from typing import Dict, List, Any, Tuple
import pandas as pd
import numpy as np

def clamp(val: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, val))

def compute_risk_dimensions(row: pd.Series) -> Dict[str, Any]:
    # -------------------------------------------------------------
    # 1. Financial Risk (0 - 100)
    # -------------------------------------------------------------
    cost_ratio = float(row.get("cost_to_peer_ratio", 1.0))
    cost_z = float(row.get("cost_z_score", 0.0))
    exp_ratio = float(row.get("expenditure_ratio", 0.8))
    
    fin_score = 20.0 # baseline normal
    if cost_ratio > 2.2:
        fin_score = 85.0 + min(15.0, (cost_ratio - 2.2) * 15.0)
    elif cost_ratio > 1.5:
        fin_score = 65.0 + (cost_ratio - 1.5) * 25.0
    elif cost_ratio > 1.2:
        fin_score = 45.0 + (cost_ratio - 1.2) * 50.0
    elif cost_z > 1.8:
        fin_score = 60.0 + min(30.0, (cost_z - 1.8) * 15.0)
        
    fin_score = clamp(fin_score)
    
    if fin_score >= 70:
        fin_exp = f"Project sanctioned cost (₹{row['sanctioned_amount']:.2f}L) is {cost_ratio:.1f}x the median benchmark (₹{row['peer_cost_median']:.2f}L) for {row['work_type']} in this district (Z-score: +{cost_z:.2f})."
    elif fin_score >= 45:
        fin_exp = f"Project cost is moderately elevated (+{(cost_ratio-1)*100:.0f}%) compared to category peer median."
    else:
        fin_exp = f"Project cost (₹{row['sanctioned_amount']:.2f}L) is well-aligned with category peers (₹{row['peer_cost_median']:.2f}L median)."

    # -------------------------------------------------------------
    # 2. Timeline Risk (0 - 100)
    # -------------------------------------------------------------
    delay_d = float(row.get("delay_days", 0))
    delay_z = float(row.get("delay_z_score", 0.0))
    delay_ratio = float(row.get("delay_ratio", 0.0))
    
    time_score = 15.0
    if delay_d > 300:
        time_score = 85.0 + min(15.0, (delay_d - 300) / 10.0)
    elif delay_d > 120:
        time_score = 65.0 + (delay_d - 120) * 0.1
    elif delay_d > 45:
        time_score = 40.0 + (delay_d - 45) * 0.3
    elif delay_z > 2.0:
        time_score = 70.0 + min(25.0, (delay_z - 2.0) * 10.0)
        
    time_score = clamp(time_score)
    
    if time_score >= 70:
        time_exp = f"Substantial project delay of {int(delay_d)} days beyond scheduled completion ({delay_ratio*100:.0f}% timeline overrun vs planned duration)."
    elif time_score >= 45:
        time_exp = f"Moderate timeline overrun of {int(delay_d)} days noted during execution phase."
    else:
        time_exp = f"Execution timeline is within normal operational tolerances (delay: {int(delay_d)} days)."

    # -------------------------------------------------------------
    # 3. Agency Risk (0 - 100)
    # -------------------------------------------------------------
    agy_delay_rate = float(row.get("agency_delay_rate", 0.2))
    agy_avg_delay = float(row.get("agency_avg_delay", 20.0))
    agy_profile = str(row.get("agency_risk_profile", "LOW"))
    
    agency_score = 20.0
    if agy_profile == "HIGH" or agy_delay_rate >= 0.70:
        agency_score = 82.0 + min(18.0, (agy_delay_rate - 0.70) * 40.0)
    elif agy_profile == "ELEVATED" or agy_delay_rate >= 0.40:
        agency_score = 55.0 + (agy_delay_rate - 0.40) * 60.0
    else:
        agency_score = 20.0 + agy_delay_rate * 30.0
        
    agency_score = clamp(agency_score)
    
    if agency_score >= 70:
        agency_exp = f"Executing agency '{row['agency_name']}' exhibits high historical delay rate ({agy_delay_rate*100:.0f}% of projects delayed, avg delay: {agy_avg_delay:.0f} days)."
    elif agency_score >= 45:
        agency_exp = f"Executing agency has moderate delay frequency ({agy_delay_rate*100:.0f}%) across assigned constituency works."
    else:
        agency_exp = f"Executing agency maintains reliable historical delivery track record ({agy_delay_rate*100:.0f}% delay rate)."

    # -------------------------------------------------------------
    # 4. Geographic Risk (0 - 100)
    # -------------------------------------------------------------
    overlap_flag = bool(row.get("spatial_overlap_flag", False))
    min_dist = float(row.get("min_dist_to_same_work_km", 5.0))
    p_500m = int(row.get("projects_within_500m", 0))
    
    geo_score = 15.0
    if overlap_flag or min_dist < 0.25:
        geo_score = 80.0 + min(20.0, (0.25 - min_dist) * 80.0)
    elif min_dist < 0.60:
        geo_score = 55.0 + (0.60 - min_dist) * 50.0
    elif p_500m >= 3:
        geo_score = 45.0 + min(25.0, p_500m * 8.0)
        
    geo_score = clamp(geo_score)
    
    if geo_score >= 70:
        geo_exp = f"Spatial proximity alert: Project is located only {min_dist*1000:.0f}m from another {row['work_type']} sanctioned within the same ward, indicating potential scope/location overlap."
    elif geo_score >= 45:
        geo_exp = f"Moderate spatial clustering: {p_500m} other MPLADS works identified within 500m radius."
    else:
        geo_exp = f"Isolated project location with no overlapping works detected within immediate vicinity (nearest similar work: {min_dist:.2f} km)."

    # -------------------------------------------------------------
    # 5. Similarity Risk (0 - 100)
    # -------------------------------------------------------------
    sim_score_val = float(row.get("max_semantic_similarity", 0.3))
    sim_proj_id = str(row.get("most_similar_project_id", "N/A"))
    
    sim_score = 15.0
    if sim_score_val > 0.85:
        sim_score = 85.0 + min(15.0, (sim_score_val - 0.85) * 80.0)
    elif sim_score_val > 0.70:
        sim_score = 60.0 + (sim_score_val - 0.70) * 100.0
    elif sim_score_val > 0.50:
        sim_score = 35.0 + (sim_score_val - 0.50) * 80.0
        
    sim_score = clamp(sim_score)
    
    if sim_score >= 70:
        sim_exp = f"High description similarity ({sim_score_val*100:.1f}%) with previously sanctioned project {sim_proj_id}. Scope descriptions contain nearly identical work specifications."
    elif sim_score >= 45:
        sim_exp = f"Moderate structural description similarity ({sim_score_val*100:.1f}%) with project {sim_proj_id}."
    else:
        sim_exp = f"Standard distinct project description (top semantic similarity: {sim_score_val*100:.1f}%)."

    # -------------------------------------------------------------
    # 6. Overall Weighted Priority Score (0 - 100)
    # Weights: Fin=25%, Time=25%, Agency=20%, Geo=15%, Sim=15%
    # -------------------------------------------------------------
    priority_score = (
        0.25 * fin_score +
        0.25 * time_score +
        0.20 * agency_score +
        0.15 * geo_score +
        0.15 * sim_score
    )
    
    # Adjust slightly if Isolation Forest flagged as multivariate outlier
    iso_score = float(row.get("isolation_forest_score", 0.0))
    if iso_score > 0.75:
        priority_score = min(98.0, priority_score * 1.08)
        
    priority_score = clamp(round(priority_score, 1))

    # Synthesis overall explanation
    reasons = []
    if fin_score >= 60:
        reasons.append("Elevated cost deviation compared to peer benchmark")
    if time_score >= 60:
        reasons.append(f"Substantial execution delay ({int(delay_d)} days)")
    if agency_score >= 60:
        reasons.append("Agency with elevated historical delay rate")
    if geo_score >= 60:
        reasons.append("Proximity clustering / potential scope overlap")
    if sim_score >= 60:
        reasons.append(f"High semantic similarity with project {sim_proj_id}")
        
    if reasons:
        overall_exp = (
            f"Investigation priority elevated ({priority_score}/100) due to: "
            + "; ".join(reasons) + ". "
            f"Recommended for detailed desk audit and on-site physical measurement verification."
        )
    else:
        overall_exp = (
            f"Project parameters are consistent with baseline benchmarks across financial, "
            f"timeline, and geographic dimensions (Priority Score: {priority_score}/100)."
        )

    # Recommended Verification Checklist
    recommended_checks = [
        "Cross-examine Measurement Book (MB) entries against sanctioned structural drawings.",
        "Verify physical site GPS coordinates against previously completed road/drain assets in Ward 12.",
        "Review Contractor Work Order and Tender Award comparative statements.",
        "Check agency milestone achievement certificates submitted for fund release tranche II & III.",
        "Perform field inspection with local Gram Panchayat / Ward Committee members."
    ]

    return {
        "priority_score": priority_score,
        "financial_risk": round(fin_score, 1),
        "timeline_risk": round(time_score, 1),
        "agency_risk": round(agency_score, 1),
        "geographic_risk": round(geo_score, 1),
        "similarity_risk": round(sim_score, 1),
        "financial_explanation": fin_exp,
        "timeline_explanation": time_exp,
        "agency_explanation": agency_exp,
        "geographic_explanation": geo_exp,
        "similarity_explanation": sim_exp,
        "overall_explanation": overall_exp,
        "recommended_verification": recommended_checks
    }
