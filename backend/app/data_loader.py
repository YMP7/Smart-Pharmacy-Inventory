import pandas as pd
import re

def normalize_name(name: str) -> str:
    if pd.isna(name):
        return "unknown"
    name = name.lower()
    name = re.sub(r"[-_]", " ", name)
    name = re.sub(r"\s+", " ", name)
    return name.strip()


def load_and_clean():
    sales = pd.read_json("../data/pharmacy_sales_noisy.json")
    purchases = pd.read_json("../data/pharmacy_purchases_noisy.json")

    # ---------------- SALES ----------------
    sales["Date"] = pd.to_datetime(sales["Date"], errors="coerce")
    sales = sales[sales["Date"].dt.year < 2090]

    sales["Drug_Name"] = sales["Drug_Name"].apply(normalize_name)
    sales["Qty_Sold"] = sales["Qty_Sold"].fillna(0)
    sales["MRP_Unit_Price"] = sales["MRP_Unit_Price"].clip(lower=0)

    # Batch (safe fallback)
    sales["Batch_No"] = sales.get("Batch_No", "UNKNOWN")

    # ---------------- PURCHASES ----------------
    purchases["Date_Received"] = pd.to_datetime(
        purchases["Date_Received"], errors="coerce"
    )
    purchases["Expiry_Date"] = pd.to_datetime(
        purchases["Expiry_Date"], errors="coerce"
    )

    purchases["Drug_Name"] = purchases["Drug_Name"].apply(normalize_name)
    purchases["Qty_Received"] = purchases["Qty_Received"].fillna(0)
    purchases["Unit_Cost_Price"] = purchases["Unit_Cost_Price"].clip(lower=0)

    # Batch (safe fallback)
    purchases["Batch_No"] = purchases.get("Batch_No", "UNKNOWN")

    return sales, purchases
