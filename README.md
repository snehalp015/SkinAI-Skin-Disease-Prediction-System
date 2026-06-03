# Skin Disease Detector

AI-powered skin disease detection using Flask (backend) + React (frontend).

---

## Folder Structure

```
skin-disease-detector/
│
├── backend/
│   ├── app.py                  ← Flask API
│   ├── requirements.txt        ← Python dependencies
│   ├── skin_model.h5           ← (your model file — copy here)
│   └── label_encoder.pkl       ← (your encoder file — copy here)
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        ├── components/
        │   ├── Uploader.js
        │   └── Result.js
        └── services/
            └── api.js
```

---

## Step 1 — Copy Model Files

Copy your model and encoder into the `backend/` folder:

```
backend/skin_model.h5
backend/label_encoder.pkl
```

---

## Step 2 — Run Backend (Flask)

Open **Terminal 1**:

```bash
cd skin-disease-detector/backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

Flask runs at: http://127.0.0.1:5000

---

## Step 3 — Run Frontend (React)

Open **Terminal 2**:

```bash
cd skin-disease-detector/frontend

npm install

npm start
```

React runs at: http://localhost:3000

---

## Usage

1. Open http://localhost:3000 in browser
2. Upload a skin image (drag & drop or click)
3. Click "Analyze Image"
4. See disease prediction, confidence %, and cause

---

## Notes

- Both terminals must be running at the same time
- Flask must be on port 5000 (already set in api.js)
- Model supports: melanoma, nv (mole), bcc (basal cell carcinoma)
