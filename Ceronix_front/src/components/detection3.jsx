import axios from "axios";
import React, { useState } from "react";
import placeholderImage from "../assets/background.png";
import sampleOutput from "../assets/test2.jpg"; // Import your sample image
import "./detection3.css";

export default function Detection3() {
  const [file, setFile] = useState(null);
  const [scratches, setScratches] = useState([]);
  const [outputUrl, setOutputUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Please choose an image first");
      return;
    }

    setLoading(true);
    setScratches([]);
    setOutputUrl("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://127.0.0.1:8001/predict2", formData, {
        timeout: 60000,
      });

      console.log("Backend Response:", res.data);

      const data = res.data || {};
      const detectedScratches = Array.isArray(data.scratches)
        ? data.scratches
        : [];

      if (detectedScratches.length === 0) {
        setScratches(["Genuine"]);
      } else {
        setScratches(detectedScratches);
      }

      if (data.output_url) {
        setOutputUrl(`http://127.0.0.1:8001${data.output_url}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Error calling backend:", err);
      setScratches(["⚠️ Could not connect to backend"]);
      setOutputUrl(placeholderImage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detection3-container">
      <div className="detection3-content">
        <h1 className="detection3-title">Scratch Detector</h1>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="detection3-file-input-container"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="detection3-detect-button"
        >
          {loading ? (
            <>
              <span className="detection3-loading-spinner"></span>
              Processing...
            </>
          ) : (
            "Detect Scratches"
          )}
        </button>

        <div className="detection3-results-container">
          {scratches.length > 0 ? (
            <p>
              <b>Result:</b> {scratches.join(", ")}
            </p>
          ) : (
            <p>Upload an image to detect scratches.</p>
          )}
        </div>

        {outputUrl && (
          <div className="detection3-results-container">
            <img
              src={outputUrl}
              alt="Scratch Detection Result"
              className="detection3-result-image"
            />
          </div>
        )}

        {/* Sample Output Section - Always visible below the output */}
        <div className="detection3-results-container">
          <p>Sample Output</p>
          <img
            src={sampleOutput}
            alt="Sample Scratch Detection"
            className="result-image"
          />
        </div>
      </div>
    </div>
  );
}
