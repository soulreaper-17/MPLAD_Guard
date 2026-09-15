"""
Feature Engineering Pipeline for MPLAD-GUARD AI
Extracts multi-dimensional features (Financial, Timeline, Agency, Geographic, Similarity).
"""
import math
from datetime import datetime
from typing import Dict, List, Any
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two geo points."""
    R = 6371.0 # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes all analytical features across Financial, Timeline, Agency, Geo, and Similarity.
    """
    df = df.copy()
    now = datetime(2025, 1, 1) # Reference date for prototype
    
    # -------------------------------------------------------------
    # 1. Timeline Calculations
    # -------------------------------------------------------------
    exp_durations = []
    actual_durations = []
    delay_days_list = []
    
    for _, row in df.iterrows():
        st = row["start_date"] if pd.notnull(row["start_date"]) else row["sanction_date"]
        exp_comp = row["expected_completion_date"] if pd.notnull(row["expected_completion_date"]) else st
        act_comp = row["actual_completion_date"]
        
        # Expected duration
        exp_dur = max(1, (exp_comp - st).days)
        exp_durations.append(exp_dur)
        
        # Actual or ongoing duration
        if pd.notnull(act_comp):
            act_dur = (act_comp - st).days
            del_d = max(0, (act_comp - exp_comp).days)
        else:
            # Ongoing / delayed
            act_dur = max(0, (now - st).days)
            del_d = max(0, (now - exp_comp).days) if now > exp_comp else 0
            
        actual_durations.append(act_dur)
        delay_days_list.append(del_d)
        
    df["expected_duration_days"] = exp_durations
    df["actual_duration_days"] = actual_durations
    df["delay_days"] = delay_days_list
    df["delay_ratio"] = df["delay_days"] / df["expected_duration_days"]
    
    # -------------------------------------------------------------
    # 2. Financial Calculations
    # -------------------------------------------------------------
    df["expenditure_ratio"] = df["expenditure"] / (df["sanctioned_amount"] + 1e-5)
    df["release_ratio"] = df["released_amount"] / (df["sanctioned_amount"] + 1e-5)
    
    # Peer Group Financial & Timeline baselines by Work Type
    category_stats = {}
    for wt, group in df.groupby("work_type"):
        category_stats[wt] = {
            "cost_median": group["sanctioned_amount"].median(),
            "cost_std": group["sanctioned_amount"].std() if len(group) > 1 else 1.0,
            "delay_median": group["delay_days"].median(),
            "delay_std": group["delay_days"].std() if len(group) > 1 else 1.0,
        }
        
    cost_medians = []
    cost_z_scores = []
    cost_to_peer_ratios = []
    delay_z_scores = []
    
    for _, row in df.iterrows():
        wt = row["work_type"]
        stats = category_stats.get(wt, {"cost_median": 25.0, "cost_std": 5.0, "delay_median": 20.0, "delay_std": 20.0})
        
        c_med = stats["cost_median"]
        c_std = max(1.0, stats["cost_std"])
        d_med = stats["delay_median"]
        d_std = max(1.0, stats["delay_std"])
        
        cost_medians.append(c_med)
        cost_z_scores.append((row["sanctioned_amount"] - c_med) / c_std)
        cost_to_peer_ratios.append(row["sanctioned_amount"] / (c_med + 1e-5))
        delay_z_scores.append((row["delay_days"] - d_med) / d_std)
        
    df["peer_cost_median"] = cost_medians
    df["cost_z_score"] = cost_z_scores
    df["cost_to_peer_ratio"] = cost_to_peer_ratios
    df["delay_z_score"] = delay_z_scores
    
    # -------------------------------------------------------------
    # 3. Agency Behavioral Profiling
    # -------------------------------------------------------------
    agency_stats = {}
    for agy_id, group in df.groupby("agency_id"):
        tot = len(group)
        delayed_projs = len(group[group["delay_days"] > 45])
        completed = len(group[group["status"] == "Completed"])
        avg_c = group["sanctioned_amount"].mean()
        avg_d = group["delay_days"].mean()
        delay_rate = delayed_projs / tot if tot > 0 else 0.0
        comp_rate = completed / tot if tot > 0 else 0.0
        
        agency_stats[agy_id] = {
            "project_count": tot,
            "completed_count": completed,
            "delayed_count": delayed_projs,
            "delay_rate": delay_rate,
            "completion_rate": comp_rate,
            "average_cost": avg_c,
            "average_delay": avg_d,
            "risk_profile_level": "HIGH" if delay_rate > 0.60 or avg_d > 120 else ("ELEVATED" if delay_rate > 0.35 else "LOW")
        }
        
    df["agency_project_count"] = df["agency_id"].apply(lambda aid: agency_stats[aid]["project_count"])
    df["agency_delay_rate"] = df["agency_id"].apply(lambda aid: agency_stats[aid]["delay_rate"])
    df["agency_avg_delay"] = df["agency_id"].apply(lambda aid: agency_stats[aid]["average_delay"])
    df["agency_risk_profile"] = df["agency_id"].apply(lambda aid: agency_stats[aid]["risk_profile_level"])
    
    # -------------------------------------------------------------
    # 4. Geographic Clustering & Spatial Proximity
    # -------------------------------------------------------------
    nearby_500m_counts = []
    nearby_2km_counts = []
    min_dist_to_same_work_list = []
    has_spatial_overlap_flag = []
    
    coords = df[["latitude", "longitude", "work_type", "project_id"]].to_dict(orient="records")
    
    for i, p1 in enumerate(coords):
        count_500m = 0
        count_2km = 0
        min_same_dist = 999.0
        overlap_flag = False
        
        for j, p2 in enumerate(coords):
            if i == j:
                continue
            dist_km = haversine_distance(p1["latitude"], p1["longitude"], p2["latitude"], p2["longitude"])
            if dist_km <= 0.5:
                count_500m += 1
            if dist_km <= 2.0:
                count_2km += 1
            if p1["work_type"] == p2["work_type"]:
                if dist_km < min_same_dist:
                    min_same_dist = dist_km
                # Spatial duplication risk flag (< 350 meters for same work type)
                if dist_km < 0.35:
                    overlap_flag = True
                    
        nearby_500m_counts.append(count_500m)
        nearby_2km_counts.append(count_2km)
        min_dist_to_same_work_list.append(round(min_same_dist, 3) if min_same_dist < 900 else 10.0)
        has_spatial_overlap_flag.append(overlap_flag)
        
    df["projects_within_500m"] = nearby_500m_counts
    df["projects_within_2km"] = nearby_2km_counts
    df["min_dist_to_same_work_km"] = min_dist_to_same_work_list
    df["spatial_overlap_flag"] = has_spatial_overlap_flag
    
    # -------------------------------------------------------------
    # 5. Semantic Similarity & Work Scope Overlap
    # -------------------------------------------------------------
    combined_texts = (df["project_name"].fillna("") + " " + df["description"].fillna("")).tolist()
    tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=500)
    tfidf_matrix = tfidf.fit_transform(combined_texts)
    sim_matrix = cosine_similarity(tfidf_matrix)
    
    max_similarity_scores = []
    most_similar_project_ids = []
    
    for idx in range(len(df)):
        sim_scores = sim_matrix[idx].copy()
        sim_scores[idx] = -1.0 # ignore self
        top_idx = int(np.argmax(sim_scores))
        top_score = float(sim_scores[top_idx])
        
        # If projects are in the same block/ward and share work type, boost semantic scope overlap
        p_curr = df.iloc[idx]
        p_top = df.iloc[top_idx]
        if p_curr["work_type"] == p_top["work_type"] and p_curr["block_name"] == p_top["block_name"]:
            if p_curr["gram_panchayat_or_ward"] == p_top["gram_panchayat_or_ward"]:
                top_score = min(0.96, top_score + 0.45)
            else:
                top_score = min(0.85, top_score + 0.20)
                
        max_similarity_scores.append(round(top_score, 3))
        most_similar_project_ids.append(df.iloc[top_idx]["project_id"])
        
    df["max_semantic_similarity"] = max_similarity_scores
    df["most_similar_project_id"] = most_similar_project_ids
    
    return df, agency_stats, category_stats
