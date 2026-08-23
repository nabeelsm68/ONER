"""
ONER Forecaster
7-day CO2 and energy forecasting using GradientBoostingRegressor
with lag features, day-of-week, and operational covariates.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from data_generator import get_dataset

_forecast_cache = None


def _build_features(df: pd.DataFrame) -> pd.DataFrame:
    """Engineer lag and calendar features."""
    df = df.copy().reset_index(drop=True)

    for lag in [1, 7, 14]:
        df[f"co2_lag{lag}"] = df["co2_tonnes"].shift(lag)
        df[f"elec_lag{lag}"] = df["electricity_kwh"].shift(lag)

    df["dayofweek"] = pd.to_datetime(df["timestamp"]).dt.dayofweek
    df["day_idx"] = np.arange(len(df))

    # Rolling means
    df["co2_roll7"] = df["co2_tonnes"].shift(1).rolling(7).mean()
    df["elec_roll7"] = df["electricity_kwh"].shift(1).rolling(7).mean()

    return df


def _train_models():
    df = get_dataset()
    feat_df = _build_features(df)

    feature_cols = [
        "co2_lag1", "co2_lag7", "co2_lag14",
        "elec_lag1", "elec_lag7", "elec_lag14",
        "co2_roll7", "elec_roll7",
        "dayofweek", "day_idx",
        "production_output", "temperature_c", "machine_utilization",
        "furnace_temperature", "compressor_load",
    ]

    # Drop rows with NaN lags
    train = feat_df.dropna(subset=feature_cols)
    X = train[feature_cols].values
    y_co2 = train["co2_tonnes"].values
    y_elec = train["electricity_kwh"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    co2_model = GradientBoostingRegressor(
        n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42
    )
    elec_model = GradientBoostingRegressor(
        n_estimators=200, learning_rate=0.05, max_depth=4, random_state=42
    )
    co2_model.fit(X_scaled, y_co2)
    elec_model.fit(X_scaled, y_elec)

    return co2_model, elec_model, scaler, feat_df, feature_cols


def get_forecast():
    global _forecast_cache
    if _forecast_cache is not None:
        return _forecast_cache

    co2_model, elec_model, scaler, feat_df, feature_cols = _train_models()
    df = get_dataset()

    # Last 30 days of actual data for chart context
    historical = feat_df.tail(30).copy()
    historical["date"] = pd.to_datetime(historical["timestamp"]).dt.strftime("%Y-%m-%d")

    historical_records = historical[[
        "date", "co2_tonnes", "electricity_kwh", "production_output"
    ]].to_dict(orient="records")

    # Forecast 7 days iteratively
    last_row = feat_df.iloc[-1].copy()
    last_date = pd.to_datetime(last_row["timestamp"])

    # Running buffers for iterative prediction
    co2_buf = list(feat_df["co2_tonnes"].values)
    elec_buf = list(feat_df["electricity_kwh"].values)

    forecast_records = []
    for step in range(1, 8):
        future_date = last_date + pd.Timedelta(days=step)
        dayofweek = future_date.dayofweek
        day_idx = len(df) + step

        # Lag features from buffer
        co2_l1 = co2_buf[-1]
        co2_l7 = co2_buf[-7] if len(co2_buf) >= 7 else co2_buf[0]
        co2_l14 = co2_buf[-14] if len(co2_buf) >= 14 else co2_buf[0]
        elec_l1 = elec_buf[-1]
        elec_l7 = elec_buf[-7] if len(elec_buf) >= 7 else elec_buf[0]
        elec_l14 = elec_buf[-14] if len(elec_buf) >= 14 else elec_buf[0]
        co2_roll7 = np.mean(co2_buf[-7:])
        elec_roll7 = np.mean(elec_buf[-7:])

        # Project production slightly (assume similar to recent)
        prod_proj = df["production_output"].tail(7).mean() * (0.65 if dayofweek >= 5 else 1.0)
        temp_proj = df["temperature_c"].tail(7).mean() + step * 0.2  # slight warming trend
        mutil = df["machine_utilization"].tail(7).mean()
        ftemp = df["furnace_temperature"].tail(7).mean()
        cload = df["compressor_load"].tail(7).mean()

        X_pred = np.array([[
            co2_l1, co2_l7, co2_l14,
            elec_l1, elec_l7, elec_l14,
            co2_roll7, elec_roll7,
            dayofweek, day_idx,
            prod_proj, temp_proj, mutil, ftemp, cload,
        ]])
        X_pred_scaled = scaler.transform(X_pred)

        pred_co2 = float(co2_model.predict(X_pred_scaled)[0])
        pred_elec = float(elec_model.predict(X_pred_scaled)[0])

        co2_buf.append(pred_co2)
        elec_buf.append(pred_elec)

        forecast_records.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "co2_tonnes": round(pred_co2, 3),
            "electricity_kwh": round(pred_elec, 1),
            "is_forecast": True,
        })

    # Trend summary
    hist_co2_avg = df["co2_tonnes"].tail(7).mean()
    fore_co2_avg = np.mean([r["co2_tonnes"] for r in forecast_records])
    co2_trend_pct = (fore_co2_avg - hist_co2_avg) / hist_co2_avg * 100

    hist_elec_avg = df["electricity_kwh"].tail(7).mean()
    fore_elec_avg = np.mean([r["electricity_kwh"] for r in forecast_records])
    elec_trend_pct = (fore_elec_avg - hist_elec_avg) / hist_elec_avg * 100

    result = {
        "historical": historical_records,
        "forecast": forecast_records,
        "summary": {
            "co2_trend_pct": round(co2_trend_pct, 1),
            "elec_trend_pct": round(elec_trend_pct, 1),
            "co2_trend_direction": "increasing" if co2_trend_pct > 1 else ("decreasing" if co2_trend_pct < -1 else "stable"),
            "forecast_period_days": 7,
            "model": "GradientBoostingRegressor with lag, calendar, and operational features",
        },
    }

    _forecast_cache = result
    return result
