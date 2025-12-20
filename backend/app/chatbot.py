import pandas as pd
from .chatbot_ai import predict_intent
from .substitution_engine import suggest_alternatives
from .reorder_engine import create_reorder_request

ALLOWED_INTENTS = {
    "STOCK",
    "EXPIRY",
    "WASTAGE",
    "REORDER",
    "ALTERNATIVES"
}

CONFIDENCE_THRESHOLD = 0.35

PHARMACY_KEYWORDS = [
    "stock", "expire", "expiry", "wastage",
    "loss", "reorder", "medicine", "drug",
    "batch", "inventory", "alternative", "substitute"
]

def is_pharmacy_query(query: str) -> bool:
    return any(k in query.lower() for k in PHARMACY_KEYWORDS)


def extract_medicine(query: str):
    known = [
        "dolo 650",
        "paracetamol",
        "pan 40",
        "azithral 500",
        "telma 40",
        "glycomet 500",
        "allegra 120"
    ]
    q = query.lower()
    for med in known:
        if med in q:
            return med
    return None


def process_chat(query, inventory_df, expiry_df, wastage_cost):

    intent, confidence = predict_intent(query)

    # 🚫 HARD BLOCK
    if intent not in ALLOWED_INTENTS and not is_pharmacy_query(query):
        return (
            "🚫 **Out of Scope Query**\n"
            "I am an AI Pharmacy Assistant and can help only with:\n"
            "• Medicine stock availability\n"
            "• Expiry & FEFO alerts\n"
            "• Wastage analysis\n"
            "• Reorder recommendations"
        )

    # 🟡 LOW CONFIDENCE SAFETY
    if confidence < CONFIDENCE_THRESHOLD and not is_pharmacy_query(query):
        return "🤖 Please ask about stock, expiry, wastage, or reorders."

    # ---------------- STOCK ----------------
    if intent == "STOCK":
        med = extract_medicine(query)
        if not med:
            return "📦 Please specify the medicine name."

        data = inventory_df[inventory_df["medicine"].str.lower() == med]

        if data.empty:
            return f"❌ No stock data found for {med.title()}."

        return f"📦 **Stock Update**\n{med.title()} has **{int(data.iloc[0]['stock'])} units** available."

    # ---------------- EXPIRY (FEFO) ----------------
    if intent == "EXPIRY":
        if expiry_df.empty:
            return "✅ No medicines are expiring soon."

        msg = "⏰ **Upcoming Expiries (FEFO Priority)**\n"
        for _, r in expiry_df.head(5).iterrows():
            msg += (
                f"- {r['Drug_Name'].title()} "
                f"(Batch {r['batch']}) "
                f"in {int(r['days_to_expiry'])} days\n"
            )
        return msg.strip()

    # ---------------- WASTAGE ----------------
    if intent == "WASTAGE":
        return f"💰 **Wastage Summary**\nEstimated expiry loss: ₹{wastage_cost:,.2f}"

    # ---------------- REORDER ----------------
    if intent == "REORDER":
        med = extract_medicine(query)

        # 🔹 GLOBAL REORDER REPORT
        if not med:
            low = inventory_df[inventory_df["stock"] < 50]

            if low.empty:
                return "✅ All medicines are sufficiently stocked."

            msg = "🔁 **Reorder Report**\n"
            for _, r in low.iterrows():
                msg += f"- {r['medicine'].title()} ({int(r['stock'])} units left)\n"
            return msg.strip()

        # 🔹 MEDICINE-SPECIFIC REORDER
        result = create_reorder_request(med, inventory_df)

        if result["status"] == "SUCCESS":
            return (
                f"✅ **Reorder Request Submitted**\n"
                f"Medicine: {med.title()}\n"
                f"Request ID: {result['request_id']}\n"
                f"Manager has been notified."
            )

        return f"⚠️ {result['message']}"

    # ---------------- ALTERNATIVES ----------------
    if intent == "ALTERNATIVES":
        med = extract_medicine(query)
        if not med:
            return "📦 Please specify the medicine name for alternatives."

        alternatives = suggest_alternatives(med, inventory_df)

        if alternatives.empty:
            return f"❌ No substitutes available for {med.title()}."

        msg = f"🔄 **Alternative Medicines for {med.title()}**\n"
        for _, r in alternatives.iterrows():
            msg += f"- {r['medicine'].title()} ({int(r['stock'])} units)\n"

        return msg.strip()

    return "🤖 I can assist with pharmacy inventory insights."
