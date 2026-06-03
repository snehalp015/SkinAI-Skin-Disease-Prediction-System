from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import pickle
import os

from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model("skin_model.h5")

with open("label_encoder.pkl", "rb") as f:
    label_encoder = pickle.load(f)

IMG_SIZE = 224

# ✅ Short codes → Full names
code_to_fullname = {
    "akiec": "Actinic Keratoses",
    "bcc":   "Basal Cell Carcinoma",
    "bkl":   "Benign Keratosis",
    "df":    "Dermatofibroma",
    "mel":   "Melanoma",
    "nv":    "Melanocytic Nevus (Mole)",
    "vasc":  "Vascular Lesions"
}

# ✅ Disease descriptions keyed by short code
disease_info = {
    "akiec": "Actinic Keratoses are rough, scaly patches caused by years of sun exposure. They are pre-cancerous and should be monitored by a dermatologist.",
    "bcc":   "Basal Cell Carcinoma is the most common skin cancer caused by long-term UV exposure. It rarely spreads but needs prompt treatment.",
    "bkl":   "Benign Keratosis includes non-cancerous growths like seborrheic keratoses. They are harmless but can be removed cosmetically.",
    "df":    "Dermatofibroma is a harmless firm nodule usually on the legs from minor skin injury. Rarely needs treatment.",
    "mel":   "Melanoma is a dangerous skin cancer from melanocytes. It spreads quickly if not caught early. Immediate medical attention is critical.",
    "nv":    "Melanocytic Nevus (common mole) is a benign growth from melanocytes. Usually harmless but monitor for changes in size, shape, or color.",
    "vasc":  "Vascular Lesions are blood vessel abnormalities on the skin like hemangiomas. Most are benign but some may require treatment."
}

# ✅ Risk level per disease
disease_risk = {
    "akiec": "⚠️ Pre-cancerous — See a dermatologist soon",
    "bcc":   "🔴 Cancerous — Seek medical attention promptly",
    "bkl":   "🟢 Benign — Generally harmless",
    "df":    "🟢 Benign — Usually no treatment needed",
    "mel":   "🔴 High Risk Cancer — Urgent medical attention required",
    "nv":    "🟢 Benign — Monitor for changes",
    "vasc":  "🟡 Usually Benign — Consult a doctor if growing"
}


def preprocess(path):
    img = cv2.imread(path)
    if img is None:
        raise ValueError("Image could not be loaded.")
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
    img = img.astype("float32")
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)
    return img


@app.route("/")
def home():
    return "Flask Running Successfully"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        os.makedirs("uploads", exist_ok=True)
        filepath = os.path.join("uploads", file.filename)
        file.save(filepath)

        processed = preprocess(filepath)
        prediction = model.predict(processed)

        predicted_class = int(np.argmax(prediction, axis=1)[0])
        confidence = round(float(np.max(prediction) * 100), 2)

        short_code = label_encoder.inverse_transform([predicted_class])[0].lower()
        full_name  = code_to_fullname.get(short_code, short_code.upper())
        cause      = disease_info.get(short_code, "No information available.")
        risk       = disease_risk.get(short_code, "Consult a dermatologist.")

        all_probs = {
            code_to_fullname.get(cls.lower(), cls): round(float(prob) * 100, 2)
            for cls, prob in zip(label_encoder.classes_, prediction[0])
        }

        return jsonify({
            "disease":   full_name,
            "short_code": short_code,
            "confidence": confidence,
            "cause":     cause,
            "risk":      risk,
            "all_probs": all_probs
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)