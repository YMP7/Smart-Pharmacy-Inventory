# reorder_engine.py
import pandas as pd
from datetime import datetime

def create_reorder_request(medicine, inventory_df):
    row = inventory_df[inventory_df["medicine"] == medicine]

    if row.empty:
        return {
            "status": "ERROR",
            "message": f"No inventory data found for {medicine}"
        }

    stock = int(row.iloc[0]["stock"])

    if stock > 50:
        return {
            "status": "IGNORED",
            "message": f"{medicine.title()} has sufficient stock ({stock} units)"
        }

    # Simulated manager notification (hackathon-safe)
    request_id = f"REQ-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    print(f"[MANAGER ALERT] Reorder request {request_id} for {medicine} | Stock: {stock}")

    return {
        "status": "SUCCESS",
        "request_id": request_id,
        "medicine": medicine,
        "stock": stock,
        "message": "Reorder request submitted successfully and manager notified"
    }
