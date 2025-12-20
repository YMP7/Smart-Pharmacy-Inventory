GENERIC_MAP = {
    "dolo 650": ["paracetamol", "calpol 650"],
    "pan 40": ["pantocid 40", "pantop 40"],
    "azithral 500": ["azithromycin 500"],
    "telma 40": ["telmisartan 40"]
}

def suggest_alternatives(medicine, inventory_df):
    medicine = medicine.lower()
    alternatives = GENERIC_MAP.get(medicine, [])

    return inventory_df[
        inventory_df["medicine"].isin(alternatives) &
        (inventory_df["stock"] > 0)
    ][["medicine", "stock"]]
