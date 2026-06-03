import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState("");
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleImage = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handlePredict = async () => {
    if (!image) { alert("Please upload an image first."); return; }
    const formData = new FormData();
    formData.append("file", image);
    try {
      setLoading(true);
      const res  = await fetch("http://127.0.0.1:5000/predict", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Prediction failed. Make sure Flask is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  const getConfStyle = (conf) => {
    if (conf >= 80) return { label: "High Confidence",     color: "#16a34a", bg: "rgba(22,163,74,0.12)"  };
    if (conf >= 50) return { label: "Moderate Confidence", color: "#d97706", bg: "rgba(217,119,6,0.12)"  };
    return                  { label: "Low Confidence",      color: "#dc2626", bg: "rgba(220,38,38,0.12)" };
  };

  const confStyle   = result ? getConfStyle(result.confidence) : null;
  const sortedProbs = result?.all_probs
    ? Object.entries(result.all_probs).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="app-wrapper">

      {/* NAVBAR */}
      <nav className="app-nav">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <span className="nav-logo">🔬</span>
            <span className="nav-brand">SkinAI</span>
          </div>
          <span className="nav-tag">AI Powered Diagnosis</span>
        </div>
      </nav>

      {/* HERO */}
      <div className="page-title text-center">
        <div className="container">
          <h1>Skin Disease Detector</h1>
          <p>Upload a skin image to get an AI-powered diagnosis</p>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="container main-layout">
        <div className="row g-0 main-card">

          {/* LEFT — UPLOAD */}
          <div className="col-lg-6 left-col">
            <div className="col-header">
              <span className="col-dot"></span>
              <span className="col-title">Upload Image</span>
            </div>
            <div className="col-body">

              <div
                className={`drop-zone ${dragOver ? "drag-over" : ""}`}
                onClick={() => document.getElementById("fileInput").click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImage(e.dataTransfer.files[0]); }}
              >
                {preview
                  ? <img src={preview} alt="Uploaded" className="uploaded-img" />
                  : (
                    <div className="drop-inner">
                      <div className="drop-icon">📷</div>
                      <p className="drop-main">Drag & drop image here</p>
                      <p className="drop-sub">or click to browse</p>
                      <p className="drop-hint">Supports JPG, PNG, JPEG</p>
                    </div>
                  )
                }
              </div>

              <input id="fileInput" type="file" accept="image/*"
                onChange={(e) => handleImage(e.target.files[0])}
                style={{ display: "none" }}
              />

              {image && (
                <div className="file-name-row">
                  <span className="file-name-text">✅ {image.name}</span>
                  <button className="file-remove"
                    onClick={() => { setImage(null); setPreview(""); setResult(null); }}>
                    Remove
                  </button>
                </div>
              )}

              <button className="analyze-btn" onClick={handlePredict} disabled={!image || loading}>
                {loading
                  ? <><span className="btn-spin"></span>&nbsp; Analyzing...</>
                  : "🔍  Analyze Image"
                }
              </button>

            </div>
          </div>

          {/* RIGHT — RESULT */}
          <div className="col-lg-6 right-col">
            <div className="col-header">
              <span className="col-dot"></span>
              <span className="col-title">Diagnosis Result</span>
            </div>
            <div className="col-body">

              {loading && (
                <div className="state-box">
                  <div className="state-spinner"></div>
                  <p className="state-text">Analyzing your image with AI...</p>
                </div>
              )}

              {!loading && !result && (
                <div className="state-box">
                  <div className="state-icon">🩺</div>
                  <p className="state-text">Upload an image and click<br /><strong>Analyze Image</strong></p>
                </div>
              )}

              {!loading && result && result.error && (
                <div className="state-box">
                  <div className="state-icon">❌</div>
                  <p className="state-text" style={{ color: "#fca5a5" }}>{result.error}</p>
                </div>
              )}

              {!loading && result && !result.error && (
                <div className="result-content">

                  {/* DISEASE NAME */}
                  <div className="result-disease-card">
                    <div className="result-label">Detected Condition</div>
                    <div className="result-disease">{result.disease}</div>
                    <div style={{ marginTop: "10px", fontSize: "0.88rem", color: "#fde68a" }}>
                      {result.risk}
                    </div>
                  </div>

                  {/* CONFIDENCE */}
                  <div className="result-section">
                    <div className="result-label">Confidence Score</div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="conf-badge"
                        style={{ color: confStyle.color, background: confStyle.bg }}>
                        {confStyle.label}
                      </span>
                      <span className="conf-percent" style={{ color: confStyle.color }}>
                        {result.confidence}%
                      </span>
                    </div>
                    <div className="conf-bar-bg">
                      <div className="conf-bar-fill"
                        style={{ width: `${result.confidence}%`, background: confStyle.color }}>
                      </div>
                    </div>
                  </div>

                  {/* ABOUT */}
                  <div className="result-section">
                    <div className="result-label">About this Condition</div>
                    <p className="result-about">{result.cause}</p>
                  </div>

                  {/* ALL PROBABILITIES */}
                  {sortedProbs.length > 0 && (
                    <div className="result-section">
                      <div className="result-label">All Class Probabilities</div>
                      {sortedProbs.map(([name, prob]) => (
                        <div key={name} style={{ marginBottom: "10px" }}>
                          <div className="d-flex justify-content-between"
                            style={{ fontSize: "0.82rem", color: "#cbd5e1", marginBottom: "4px" }}>
                            <span>{name}</span>
                            <span style={{ fontWeight: 700 }}>{prob}%</span>
                          </div>
                          <div className="conf-bar-bg" style={{ height: "8px" }}>
                            <div className="conf-bar-fill" style={{
                              width: `${prob}%`,
                              background: name === result.disease ? "#60a5fa" : "rgba(255,255,255,0.25)"
                            }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* WARNING */}
                  <div className="result-warning">
                    ⚠️ This is an AI prediction only. Please consult a certified dermatologist for proper medical diagnosis and treatment.
                  </div>

                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <footer className="app-footer text-center">
        <p>SkinAI — For educational purposes only. Not a substitute for professional medical advice.</p>
      </footer>

    </div>
  );
}

export default App;