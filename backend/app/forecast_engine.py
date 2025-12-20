from prophet import Prophet
import pandas as pd
from datetime import timedelta

def forecast_demand(df, drug):
    drug = drug.lower().strip()
    drug_df = df[df["Drug_Name"].str.lower() == drug].copy()

    if drug_df.empty:
        return []

    ts = (
        drug_df
        .groupby("Date")["Qty_Sold"]
        .sum()
        .reset_index()
        .rename(columns={"Date": "ds", "Qty_Sold": "y"})
    )

    if len(ts) < 10:
        return []

    model = Prophet()
    model.fit(ts)

    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)

    merged = forecast.merge(ts, on="ds", how="left")
    merged["y"] = merged["y"].fillna(0)
    merged["moving_avg"] = merged["y"].rolling(7).mean().fillna(0)

    # --- Demand surge detection ---
    recent_actual = ts["y"].tail(7).mean()
    future_forecast = forecast["yhat"].tail(7).mean()
    surge_alert = future_forecast > recent_actual * 1.3

    # --- Seasonal spike ---
    rolling_mean = ts["y"].rolling(30).mean()
    seasonal_spike = rolling_mean.max() > ts["y"].mean() * 1.25

    # --- Accuracy (MAPE) ---
    valid = merged[(merged["y"] > 0)]
    mape = (
        (abs(valid["y"] - valid["yhat"]) / valid["y"]).mean() * 100
        if not valid.empty else None
    )

    avg_daily_demand = ts["y"].mean()
    reorder_qty = int(avg_daily_demand * 7)
    reorder_date = (pd.Timestamp.now() + timedelta(days=5)).strftime("%Y-%m-%d")

    result = merged.tail(30).copy()
    result["actual"] = result["y"]
    result["reorder_qty"] = reorder_qty
    result["reorder_date"] = reorder_date
    result["mape"] = round(mape, 2) if mape else None
    result["demand_surge"] = surge_alert
    result["seasonal_spike"] = seasonal_spike

    return result[[
        "ds",
        "actual",
        "yhat",
        "moving_avg",
        "reorder_qty",
        "reorder_date",
        "mape",
        "demand_surge",
        "seasonal_spike"
    ]].to_dict(orient="records")
