"""
ML Anomaly Detection Pipeline for MPLAD-GUARD AI
Uses unsupervised Isolation Forest and Statistical dispersion measures.
Produces anomaly screening signals for investigation prioritization.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def run_anomaly_models(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    
    feature_cols = [
        "cost_z_score",
        "cost_to_peer_ratio",
        "expenditure_ratio",
        "delay_z_score",
        "delay_ratio",
        "agency_delay_rate",
        "projects_within_500m",
        "max_semantic_similarity"
    ]
    
    X = df[feature_cols].fillna(0).values
    
    # Train unsupervised Isolation Forest
    # Contamination set to approx 10% expected elevated review candidate rate
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.12,
        random_state=42
    )
    
    predictions = iso_forest.fit_predict(X) # -1: anomaly, 1: normal
    raw_scores = iso_forest.decision_function(X) # Lower values mean more anomalous
    
    # Normalize score into [0, 1] range where 1.0 is highest anomaly signal
    min_s = float(np.min(raw_scores))
    max_s = float(np.max(raw_scores))
    
    if max_s > min_s:
        normalized_anomaly_scores = 1.0 - ((raw_scores - min_s) / (max_s - min_s))
    else:
        normalized_anomaly_scores = np.zeros(len(raw_scores))
        
    df["isolation_forest_score"] = [round(float(s), 4) for s in normalized_anomaly_scores]
    df["is_anomaly"] = [bool(p == -1) for p in predictions]
    
    return df
