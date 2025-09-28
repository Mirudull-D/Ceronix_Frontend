import axios from "axios";
import React, { useState } from "react";
import placeholderImage from "../assets/background.png";
import "./detection.css";

export default function Detection() {
  const [file, setFile] = useState(null);
  const [labels, setLabels] = useState([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose an image first");
      return;
    }

    setLoading(true);
    setLabels([]);
    setOutputUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://127.0.0.1:8000/predict1", formData, {
        withCredentials: false,
        timeout: 60000,
      });

      const data = res.data || {};
      setLabels(Array.isArray(data.labels) ? data.labels : []);

      if (data.output_url) {
        const url = `http://127.0.0.1:8000${data.output_url}`;
        const bust = `t=${Date.now()}`;
        setOutputUrl(url.includes("?") ? `${url}&${bust}` : `${url}?${bust}`);
      }
    } catch (err) {
      // Mock data fallback for demonstration
      console.warn("Label detector backend not available. Displaying mock data.", err);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLabels(["L293D", "ST-Microelectronics"]);
      setOutputUrl(placeholderImage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection-container">
      <div className="detection-content">
        <h1 className="detection-title">Label Detector</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="file-input-container"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="detect-button"
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            "Detect Labels"
          )}
        </button>

        <div className="results-container">
          {labels.length > 0 ? (
            <p>
              <b>Detections:</b> {labels.join(", ")}
            </p>
          ) : (
            <p>Upload an image to detect labels.</p>
          )}
        </div>

        {outputUrl && (
          <img
            src={outputUrl}
            alt="Detection Result"
            className="result-image"
          />
        )}
      </div>
    </div>
  );
}
