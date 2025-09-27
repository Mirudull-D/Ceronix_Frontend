import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Detection2.css";

// ---- MOCK DATA GENERATOR ----
function createMockReading() {
  return {
    supply_v: 12 + (Math.random() * 0.2 - 0.1), // ~12 V ±0.1
    output_v: 11.5 + (Math.random() * 0.3 - 0.15), // ~11.5 V ±0.15
    voltage_drop: 0.4 + Math.random() * 0.1, // ~0.4–0.5 V
    current: 0.3 + Math.random() * 0.2, // ~0.3–0.5 A
    temp: 30 + Math.random() * 5, // ~30–35 °C
  };
}

// ---- VALIDATION LOGIC ----
function evaluateChip(data) {
  let issues = 0;

  if (data.supply_v < 10 || data.supply_v > 14) issues++;
  if (data.voltage_drop > 1.0) issues++;
  if (data.current < 0.05 || data.current > 2.0) issues++;
  if (data.temp > 70) issues++;

  return issues >= 2 ? "Likely FAKE" : "Likely REAL";
}

export default function Detection2() {
  const [reading, setReading] = useState(createMockReading());
  const [history, setHistory] = useState([]);
  const [isMock, setIsMock] = useState(true);
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/l293d", {
          timeout: 1500,
        });
        if (res.data && !res.data.error) {
          setReading(res.data);
          setIsMock(false);
        } else {
          throw new Error("Invalid data");
        }
      } catch (err) {
        // Backend not available → mock data
        setReading(createMockReading());
        setIsMock(true);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStatus(evaluateChip(reading));
    setHistory((prev) => {
      const entry = {
        time: new Date().toLocaleTimeString().split(" ")[0],
        ...reading,
      };
      const updated = [...prev, entry];
      return updated.length > 20 ? updated.slice(-20) : updated;
    });
  }, [reading]);

  return (
    <div className="detection2-container">
      <div className="detection2-header">
        <h1 className="detection2-title">L293D Authenticity Monitor</h1>
        <p className="detection2-status">
          Status: {isMock ? "⚠️ Using Mock Data" : "✅ Live from Arduino"}
        </p>
        <div
          className={`detection2-verdict ${
            status.includes("FAKE") ? "fake" : "real"
          }`}
        >
          <h2 className="detection2-verdict-title">Chip Verdict</h2>
          <p className="detection2-verdict-text">
            {status}
          </p>
        </div>
      </div>

      <h3 className="detection2-readings-title">Latest Reading</h3>
      <div className="readings-grid">
        <div className="reading-item">
          <span className="reading-label">Supply Voltage</span>
          <span className="reading-value">
            {reading.supply_v.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Output Voltage</span>
          <span className="reading-value">
            {reading.output_v.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Voltage Drop</span>
          <span className="reading-value">
            {reading.voltage_drop.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Current</span>
          <span className="reading-value">
            {reading.current.toFixed(2)}
            <span className="reading-unit">A</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Temperature</span>
          <span className="reading-value">
            {reading.temp.toFixed(1)}
            <span className="reading-unit">°C</span>
          </span>
        </div>
      </div>

      <h3 className="detection2-readings-title">Live Analysis</h3>
      <div className="charts-grid">
        <div className="chart-container">
          <h4 className="chart-title">V/I Characteristics</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={history}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis
                type="number"
                dataKey="output_v"
                name="Voltage"
                unit="V"
                domain={["dataMin - 0.2", "dataMax + 0.2"]}
              />
              <YAxis
                type="number"
                dataKey="current"
                name="Current"
                unit="A"
                domain={["dataMin - 0.2", "dataMax + 0.2"]}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Line type="monotone" dataKey="current" stroke="#00ffff" dot={{ r: 4, fill: '#00ffff' }} className="vi-line" name="Operating Point" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4 className="chart-title">Voltage History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="time" />
              <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="supply_v" stroke="#8884d8" name="Supply" />
              <Line type="monotone" dataKey="output_v" stroke="#82ca9d" name="Output" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4 className="chart-title">Current History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="time" />
              <YAxis domain={["dataMin - 0.1", "dataMax + 0.1"]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#ff7300" name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
