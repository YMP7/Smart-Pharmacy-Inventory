from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import numpy as np

# ---------------- TRAINING DATA ----------------
TRAINING_DATA = [
    ("how many units are left", "STOCK"),
    ("check stock of dolo 650", "STOCK"),
    ("available quantity of pan 40", "STOCK"),
    ("inventory status", "STOCK"),

    ("which medicines expire soon", "EXPIRY"),
    ("expiry alert", "EXPIRY"),
    ("medicines nearing expiry", "EXPIRY"),

    ("show wastage summary", "WASTAGE"),
    ("expired medicine cost", "WASTAGE"),
    ("how much wastage happened", "WASTAGE"),

    ("generate reorder report", "REORDER"),
    ("which medicines need reorder", "REORDER"),
    ("low stock reorder list", "REORDER")
]

texts = [q for q, _ in TRAINING_DATA]
labels = [i for _, i in TRAINING_DATA]

# ---------------- MODEL ----------------
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    stop_words="english"
)

X = vectorizer.fit_transform(texts)

model = LogisticRegression()
model.fit(X, labels)

# ---------------- PREDICTION ----------------
def predict_intent(query: str):
    vec = vectorizer.transform([query.lower()])
    probs = model.predict_proba(vec)[0]

    idx = np.argmax(probs)
    intent = model.classes_[idx]
    confidence = float(probs[idx])

    return intent, confidence
