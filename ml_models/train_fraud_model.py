import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report
import joblib
import os

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved")
os.makedirs(SAVE_DIR, exist_ok=True)

np.random.seed(42)


def generate_fraud_dataset(n_normal=4000, n_fraud=500):
    # Normal claims — realistic patterns
    normal = pd.DataFrame({
        "claim_amount":        np.random.uniform(500, 3500, n_normal),
        "claims_last_7_days":  np.random.randint(0, 3, n_normal),
        "disruption_severity": np.random.uniform(1.0, 3.5, n_normal),
        "hours_since_policy":  np.random.uniform(1, 168, n_normal),
        "worker_age_days":     np.random.uniform(30, 730, n_normal),
        "avg_claim_interval":  np.random.uniform(7, 60, n_normal),
        "location_match":      np.ones(n_normal),
        "label": 0,
    })

    # Fraudulent claims — anomalous patterns
    fraud = pd.DataFrame({
        "claim_amount":        np.random.uniform(3800, 7500, n_fraud),   # unusually high
        "claims_last_7_days":  np.random.randint(4, 10, n_fraud),        # too frequent
        "disruption_severity": np.random.uniform(0.1, 0.8, n_fraud),    # low severity
        "hours_since_policy":  np.random.uniform(0, 6, n_fraud),         # claimed immediately
        "worker_age_days":     np.random.uniform(0, 15, n_fraud),        # brand new account
        "avg_claim_interval":  np.random.uniform(1, 5, n_fraud),         # claiming every day
        "location_match":      np.zeros(n_fraud),                        # GPS mismatch
        "label": 1,
    })

    df = pd.concat([normal, fraud], ignore_index=True).sample(frac=1, random_state=42)
    return df


FRAUD_FEATURES = [
    "claim_amount", "claims_last_7_days", "disruption_severity",
    "hours_since_policy", "worker_age_days", "avg_claim_interval",
    "location_match",
]


def train_fraud_model():
    print("=" * 55)
    print("  ZeroLoss — Fraud Detection Model Training")
    print("=" * 55)

    print("\n[1/4] Generating fraud dataset...")
    df = generate_fraud_dataset()
    print(f"      Total: {len(df)} | Normal: {(df.label==0).sum()} | Fraud: {(df.label==1).sum()}")

    print("\n[2/4] Scaling features...")
    X = df[FRAUD_FEATURES]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    print("\n[3/4] Training Isolation Forest...")
    # Train ONLY on normal data (unsupervised anomaly detection)
    X_normal = X_scaled[df["label"] == 0]
    model = IsolationForest(
        n_estimators=200,
        contamination=0.1,    # expect ~10% anomalies
        max_samples="auto",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_normal)

    print("\n[4/4] Evaluating on full dataset...")
    raw_preds = model.predict(X_scaled)
    # IsolationForest returns 1 (normal) or -1 (anomaly)
    preds = (raw_preds == -1).astype(int)

    print(classification_report(df["label"], preds, target_names=["Normal", "Fraud"]))

    # Save model + scaler
    joblib.dump(model,  os.path.join(SAVE_DIR, "fraud_model.joblib"))
    joblib.dump(scaler, os.path.join(SAVE_DIR, "fraud_scaler.joblib"))

    print(f"\n✅ Fraud model saved → {SAVE_DIR}/fraud_model.joblib")
    print(f"✅ Scaler saved     → {SAVE_DIR}/fraud_scaler.joblib")


if __name__ == "__main__":
    train_fraud_model()