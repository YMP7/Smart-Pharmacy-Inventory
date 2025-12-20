from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from .data_loader import load_and_clean
from .inventory_engine import calculate_inventory
from .forecast_engine import forecast_demand
from .alert_engine import low_stock_alert, expiry_alert
from .chatbot import process_chat
from .reorder_engine import create_reorder_request




# =====================================================
# LOAD DATA ON STARTUP
# =====================================================

sales, purchases = load_and_clean()
inventory = calculate_inventory(sales, purchases)


# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI(
    title="Smart Pharmacy Inventory Management API",
    version="1.0.0",
    description="AI-powered HealthTech inventory intelligence system"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # hackathon-safe
    allow_methods=["*"],
    allow_headers=["*"]
)


# =====================================================
# SCHEMAS
# =====================================================

class ChatbotRequest(BaseModel):
    query: str


# =====================================================
# DASHBOARD KPIs
# =====================================================

@app.get("/dashboard-kpis")
def dashboard_kpis():
    today = pd.Timestamp.now()

    unique_medicines = pd.concat([
        sales["Drug_Name"],
        purchases["Drug_Name"]
    ]).nunique()

    total_units = int(
        purchases["Qty_Received"].sum() -
        sales["Qty_Sold"].sum()
    )
    total_units = max(total_units, 0)

    stock_by_drug = purchases.groupby("Drug_Name")["Qty_Received"].sum().sub(
        sales.groupby("Drug_Name")["Qty_Sold"].sum(),
        fill_value=0
    )

    low_stock_count = int((stock_by_drug < 50).sum())

    expiring_soon = int(
        purchases[
            (purchases["Expiry_Date"] >= today) &
            ((purchases["Expiry_Date"] - today).dt.days <= 30)
        ].shape[0]
    )

    return {
        "unique_medicines": unique_medicines,
        "total_units": total_units,
        "low_stock": low_stock_count,
        "expiring_soon": expiring_soon
    }


# =====================================================
# INVENTORY
# =====================================================

@app.get("/inventory", tags=["Inventory"])
def get_inventory():
    return inventory.to_dict(orient="records")


# =====================================================
# FORECAST
# =====================================================

@app.get("/forecast/{drug}", tags=["Forecast"])
def get_forecast(drug: str):
    return forecast_demand(sales, drug)


# =====================================================
# ALERTS
# =====================================================

@app.get("/alerts/low-stock", tags=["Alerts"])
def get_low_stock_alerts():
    return low_stock_alert(inventory).to_dict(orient="records")


@app.get("/alerts/expiry", tags=["Alerts"])
def get_expiry_alerts():
    return expiry_alert(purchases).to_dict(orient="records")


# =====================================================
# WASTAGE
# =====================================================

@app.get("/wastage", tags=["Analytics"])
def get_wastage():
    expired = purchases[purchases["Expiry_Date"] < pd.Timestamp.now()]

    if expired.empty:
        return {"wastage_cost": 0.0}

    wastage_cost = float(
        (expired["Qty_Received"] * expired["Unit_Cost_Price"]).sum()
    )

    return {"wastage_cost": round(wastage_cost, 2)}


# =====================================================
# EXPIRY RISK ANALYTICS
# =====================================================

@app.get("/expiry-risk", tags=["Analytics"])
def expiry_risk():
    today = pd.Timestamp.now()
    df = purchases.copy()

    df["days_to_expiry"] = (df["Expiry_Date"] - today).dt.days
    df = df[df["days_to_expiry"].notna()]

    df["stock_value"] = df["Qty_Received"] * df["Unit_Cost_Price"]

    high = df[df["days_to_expiry"] <= 7]
    medium = df[(df["days_to_expiry"] > 7) & (df["days_to_expiry"] <= 30)]
    low = df[df["days_to_expiry"] > 30]

    return {
        "distribution": [
            {"name": "High Risk", "value": int(len(high))},
            {"name": "Medium Risk", "value": int(len(medium))},
            {"name": "Low Risk", "value": int(len(low))}
        ],
        "value_at_risk": [
            {"name": "High Risk", "value": float(high["stock_value"].sum())},
            {"name": "Medium Risk", "value": float(medium["stock_value"].sum())},
            {"name": "Low Risk", "value": float(low["stock_value"].sum())}
        ]
    }


# =====================================================
# CHATBOT
# =====================================================

@app.post("/chatbot", tags=["AI Assistant"])
def chatbot(request: ChatbotRequest):
    try:
        response = process_chat(
            query=request.query,
            inventory_df=inventory,
            expiry_df=expiry_alert(purchases),
            wastage_cost=get_wastage()["wastage_cost"]
        )
        return {"response": response}
    except Exception as e:
        print("Chatbot error:", e)
        return {"response": "⚠️ AI service temporarily unavailable."}

@app.get("/expiry-loss-recovery")
def expiry_loss_recovery():
    alerts = expiry_alert(purchases, days=30)

    if alerts.empty:
        return {
            "chart": [],
            "summary": {
                "total_value": 0,
                "recoverable_value": 0,
                "potential_loss": 0
            }
        }

    # Total purchase value of expiring stock
    alerts["total_value"] = alerts["Qty_Received"] * alerts["Unit_Cost_Price"]

    total_value = float(alerts["total_value"].sum())
    recoverable_value = float(alerts["recoverable_value"].sum())
    potential_loss = round(total_value - recoverable_value, 2)

    return {
        "chart": [
            { "name": "Recoverable Value", "value": round(recoverable_value, 2) },
            { "name": "Potential Loss", "value": round(potential_loss, 2) }
        ],
        "summary": {
            "total_value": round(total_value, 2),
            "recoverable_value": round(recoverable_value, 2),
            "potential_loss": round(potential_loss, 2)
        }
    }

@app.post("/reorder-request")
def reorder_request(medicine: str):
    # Simulated manager notification
    print(f"📢 Manager Alert: Reorder requested for {medicine}")

    return {
        "status": "success",
        "message": f"Reorder request for {medicine} has been sent to manager."
    }

@app.post("/chatbot")
def chatbot(request: ChatbotRequest):
    result = process_chat(
        request.query,
        inventory,
        expiry_alert(purchases),
        get_wastage()["wastage_cost"]
    )
    return result
@app.post("/reorder-request")
def reorder_request(payload: dict):
    medicine = payload.get("medicine", "").lower().strip()

    if not medicine:
        return {
            "status": "ERROR",
            "message": "Medicine name is required"
        }

    result = create_reorder_request(medicine, inventory)

    return result
