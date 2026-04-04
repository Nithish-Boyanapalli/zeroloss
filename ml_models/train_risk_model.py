import numpy as np
import pandas as pd
from xgboost import XGBRegressor, XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, accuracy_score, classification_report
from sklearn.preprocessing import LabelEncoder
import joblib
import os

SAVE_DIR = os.path.join(os.path.dirname(__file__), "saved")
os.makedirs(SAVE_DIR, exist_ok=True)

np.random.seed(42)
N = 5000


# ─────────────────────────────────────────────────────────────
# STEP 1 — Generate synthetic training data
# ─────────────────────────────────────────────────────────────

def generate_dataset(n=N):
    cities = ["mumbai", "delhi", "bangalore", "hyderabad", "chennai",
              "kolkata", "pune", "ahmedabad", "jaipur", "surat"]

    platforms = ["zomato", "swiggy", "blinkit", "amazon", "zepto"]

    city_weather_risk = {
        "mumbai": 0.85, "chennai": 0.80, "kolkata": 0.78,
        "bangalore": 0.55, "hyderabad": 0.50, "delhi": 0.65,
        "pune": 0.52, "ahmedabad": 0.60, "jaipur": 0.58, "surat": 0.62,
    }
    city_aqi_risk = {
        "delhi": 0.90, "kolkata": 0.70, "mumbai": 0.65,
        "hyderabad": 0.50, "bangalore": 0.45, "chennai": 0.48,
        "pune": 0.52, "ahmedabad": 0.60, "jaipur": 0.58, "surat": 0.62,
    }
    city_flood_risk = {
        "mumbai": 0.90, "chennai": 0.85, "kolkata": 0.80,
        "hyderabad": 0.60, "bangalore": 0.40, "delhi": 0.55,
        "pune": 0.50, "ahmedabad": 0.55, "jaipur": 0.35, "surat": 0.65,
    }
    platform_risk = {
        "zomato": 1.0, "swiggy": 1.0,
        "blinkit": 1.1, "zepto": 1.1, "amazon": 0.9,
    }

    rows = []
    for _ in range(n):
        city = np.random.choice(cities)
        platform = np.random.choice(platforms)
        weekly_hours = np.random.randint(20, 90)
        avg_weekly_income = np.random.uniform(1500, 8000)
        avg_daily_orders = np.random.randint(5, 35)

        wr = city_weather_risk[city] + np.random.normal(0, 0.05)
        ar = city_aqi_risk[city]    + np.random.normal(0, 0.05)
        fr = city_flood_risk[city]  + np.random.normal(0, 0.05)
        hr = np.random.uniform(0.2, 0.85)

        wr = float(np.clip(wr, 0.1, 1.0))
        ar = float(np.clip(ar, 0.1, 1.0))
        fr = float(np.clip(fr, 0.1, 1.0))

        hours_factor = min(weekly_hours / 60.0, 1.0)
        plat_factor  = platform_risk[platform]

        raw_score = (wr * 0.35 + ar * 0.25 + fr * 0.25 + hr * 0.15)
        raw_score = raw_score * (0.8 + 0.2 * hours_factor) * plat_factor
        risk_score = float(np.clip(raw_score + np.random.normal(0, 0.03), 0.05, 0.99))

        # Premium formula (target variable)
        risk_mult    = 0.5 + risk_score * 2.0
        income_factor = np.log10(max(avg_weekly_income, 1000) / 1000 + 1) + 0.8
        raw_premium   = 89.0 * risk_mult * income_factor
        if wr < 0.50:
            raw_premium -= 2.0
        weekly_premium = float(np.clip(raw_premium + np.random.normal(0, 5), 49, 299))

        # Coverage
        cov_mult = 0.8 + risk_score * 0.4
        coverage = float(np.clip(avg_weekly_income * cov_mult, 1200, 7000))

        # Disruption label (will disruption happen this week?)
        disruption_prob = (wr * 0.4 + ar * 0.3 + fr * 0.3) * plat_factor
        disruption_happened = int(np.random.random() < disruption_prob)

        rows.append({
            "city":              city,
            "platform":          platform,
            "weekly_hours":      weekly_hours,
            "avg_weekly_income": avg_weekly_income,
            "avg_daily_orders":  avg_daily_orders,
            "weather_risk":      wr,
            "aqi_risk":          ar,
            "flood_risk":        fr,
            "historical_risk":   hr,
            "hours_factor":      hours_factor,
            "platform_factor":   plat_factor,
            "risk_score":        risk_score,
            "weekly_premium":    weekly_premium,
            "coverage_amount":   coverage,
            "disruption_happened": disruption_happened,
        })

    return pd.DataFrame(rows)


# ─────────────────────────────────────────────────────────────
# STEP 2 — Encode categoricals
# ─────────────────────────────────────────────────────────────

def encode(df):
    le_city     = LabelEncoder()
    le_platform = LabelEncoder()
    df = df.copy()
    df["city_enc"]     = le_city.fit_transform(df["city"])
    df["platform_enc"] = le_platform.fit_transform(df["platform"])
    return df, le_city, le_platform


FEATURES = [
    "city_enc", "platform_enc", "weekly_hours", "avg_weekly_income",
    "avg_daily_orders", "weather_risk", "aqi_risk", "flood_risk",
    "historical_risk", "hours_factor", "platform_factor",
]


# ─────────────────────────────────────────────────────────────
# STEP 3 — Train risk score regressor
# ─────────────────────────────────────────────────────────────

def train_risk_model(df):
    print("\n── Training Risk Score Model (XGBRegressor) ──")
    X = df[FEATURES]
    y = df["risk_score"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    print(f"   MAE on test set: {mae:.4f}  (lower = better, target < 0.05)")

    path = os.path.join(SAVE_DIR, "risk_model.joblib")
    joblib.dump(model, path)
    print(f"   Saved → {path}")
    return model


# ─────────────────────────────────────────────────────────────
# STEP 4 — Train premium regressor
# ─────────────────────────────────────────────────────────────

def train_premium_model(df):
    print("\n── Training Premium Model (XGBRegressor) ──")
    X = df[FEATURES + ["risk_score"]]
    y = df["weekly_premium"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    preds = model.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    print(f"   MAE on test set: ₹{mae:.2f}  (target < ₹10)")

    path = os.path.join(SAVE_DIR, "premium_model.joblib")
    joblib.dump(model, path)
    print(f"   Saved → {path}")
    return model


# ─────────────────────────────────────────────────────────────
# STEP 5 — Train disruption classifier
# ─────────────────────────────────────────────────────────────

def train_disruption_classifier(df):
    print("\n── Training Disruption Classifier (XGBClassifier) ──")
    X = df[FEATURES]
    y = df["disruption_happened"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.1,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42,
        verbosity=0,
    )
    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)

    preds = model.predict(X_test)
    acc   = accuracy_score(y_test, preds)
    print(f"   Accuracy: {acc:.4f}")
    print(classification_report(y_test, preds, target_names=["No Disruption", "Disruption"]))

    path = os.path.join(SAVE_DIR, "disruption_classifier.joblib")
    joblib.dump(model, path)
    print(f"   Saved → {path}")
    return model


# ─────────────────────────────────────────────────────────────
# STEP 6 — Save encoders
# ─────────────────────────────────────────────────────────────

def save_encoders(le_city, le_platform):
    joblib.dump(le_city,     os.path.join(SAVE_DIR, "le_city.joblib"))
    joblib.dump(le_platform, os.path.join(SAVE_DIR, "le_platform.joblib"))
    print(f"\n   Encoders saved → {SAVE_DIR}")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 55)
    print("  ZeroLoss — AI Model Training Pipeline")
    print("=" * 55)

    print("\n[1/5] Generating synthetic training data...")
    df = generate_dataset(N)
    print(f"      {len(df)} samples | {df['disruption_happened'].mean():.1%} disruption rate")
    print(f"      Cities: {df['city'].nunique()} | Platforms: {df['platform'].nunique()}")

    print("\n[2/5] Encoding categorical features...")
    df_enc, le_city, le_platform = encode(df)

    print("\n[3/5] Training risk score model...")
    train_risk_model(df_enc)

    print("\n[4/5] Training premium calculator model...")
    train_premium_model(df_enc)

    print("\n[5/5] Training disruption classifier...")
    train_disruption_classifier(df_enc)

    save_encoders(le_city, le_platform)

    print("\n" + "=" * 55)
    print("  ✅ All models trained and saved to ml_models/saved/")
    print("=" * 55)

    # Quick feature importance
    import joblib as jl
    risk_model = jl.load(os.path.join(SAVE_DIR, "risk_model.joblib"))
    print("\nTop features for risk prediction:")
    feat_names = FEATURES
    importances = risk_model.feature_importances_
    for feat, imp in sorted(zip(feat_names, importances), key=lambda x: -x[1])[:5]:
        bar = "█" * int(imp * 40)
        print(f"  {feat:<25} {bar} {imp:.3f}")