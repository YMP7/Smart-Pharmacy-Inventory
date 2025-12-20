import pandas as pd

def low_stock_alert(inventory_df, threshold=50):
    alerts = inventory_df[inventory_df["stock"] < threshold].copy()
    alerts["severity"] = alerts["stock"].apply(
        lambda x: "CRITICAL" if x < 20 else "WARNING"
    )
    alerts["reason"] = "Stock below safety threshold"
    return alerts[["medicine", "stock", "severity", "reason"]]


def expiry_alert(purchases_df, days=30):
    df = purchases_df.copy()
    today = pd.Timestamp.now()

    df["Expiry_Date"] = pd.to_datetime(df["Expiry_Date"], errors="coerce")

    # Batch normalization
    batch_cols = ["Batch_Number", "Batch_No", "Batch"]
    for col in batch_cols:
        if col in df.columns:
            df["batch"] = df[col]
            break
    else:
        df["batch"] = "—"

    df["batch"] = df["batch"].fillna("—")

    df["days_to_expiry"] = (df["Expiry_Date"] - today).dt.days

    alerts = df[df["days_to_expiry"].between(0, days)].copy()
    alerts["severity"] = alerts["days_to_expiry"].apply(
        lambda d: "CRITICAL" if d <= 7 else "WARNING"
    )

    return alerts.sort_values("days_to_expiry")[[
        "Drug_Name",
        "batch",
        "Expiry_Date",
        "days_to_expiry",
        "severity"
    ]]
