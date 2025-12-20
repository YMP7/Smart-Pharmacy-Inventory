import pandas as pd

def calculate_inventory(sales, purchases):
    sold = (
        sales.groupby("Drug_Name")["Qty_Sold"]
        .sum()
        .reset_index()
        .rename(columns={"Qty_Sold": "sold"})
    )

    bought = (
        purchases.groupby("Drug_Name")["Qty_Received"]
        .sum()
        .reset_index()
        .rename(columns={"Qty_Received": "received"})
    )

    inventory = pd.merge(bought, sold, on="Drug_Name", how="left")
    inventory["sold"] = inventory["sold"].fillna(0)

    inventory["stock"] = inventory["received"] - inventory["sold"]
    inventory["stock"] = inventory["stock"].clip(lower=0)

    # frontend + chatbot expect this
    inventory = inventory.rename(columns={"Drug_Name": "medicine"})

    return inventory[["medicine", "stock"]]
