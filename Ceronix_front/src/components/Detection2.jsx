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
  // 50% chance to generate faulty data for demonstration
  if (Math.random() > 0.5) {
    return {
      supply_v: 12 + (Math.random() * 0.2 - 0.1),
      output_v: 11.5 + (Math.random() * 0.3 - 0.15),
      voltage_drop: 1.5 + Math.random() * 0.5, // BAD: > 1.0V
      current: 0.3 + Math.random() * 0.2,
      temp: 85 + Math.random() * 10, // BAD: > 70°C
    };
  }
  // Otherwise, return normal data
  return { // GOOD
    supply_v: 12 + (Math.random() * 0.2 - 0.1),
    output_v: 11.5 + (Math.random() * 0.3 - 0.15),
    voltage_drop: 0.4 + Math.random() * 0.1,
    current: 0.3 + Math.random() * 0.2,
    temp: 30 + Math.random() * 5,
  };
}

// ---- VALIDATION LOGIC ----
const isOutputVoltageOk = (v) => v >= 10.5 && v <= 12.5; // Assuming a typical range for a 12V supply
const isSupplyVoltageOk = (v) => v >= 10 && v <= 14;
const isVoltageDropOk = (v) => v <= 1.0;
const isCurrentOk = (c) => c >= 0.05 && c <= 2.0;
const isTempOk = (t) => t <= 70;

function evaluateChip(data) {
  let issues = 0;

  if (!isSupplyVoltageOk(data.supply_v)) issues++;
  if (!isVoltageDropOk(data.voltage_drop)) issues++;
  if (!isCurrentOk(data.current)) issues++;
  if (!isTempOk(data.temp)) issues++;
  
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
          <span
            className={`reading-value ${
              isSupplyVoltageOk(reading.supply_v) ? "ok" : "bad"
            }`}
          >
            {reading.supply_v.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Output Voltage</span>
          <span
            className={`reading-value ${
              isOutputVoltageOk(reading.output_v) ? "ok" : "bad"
            }`}
          >
            {reading.output_v.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Voltage Drop</span>
          <span
            className={`reading-value ${
              isVoltageDropOk(reading.voltage_drop) ? "ok" : "bad"
            }`}
          >
            {reading.voltage_drop.toFixed(2)}
            <span className="reading-unit">V</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Current</span>
          <span
            className={`reading-value ${
              isCurrentOk(reading.current) ? "ok" : "bad"
            }`}
          >
            {reading.current.toFixed(2)}
            <span className="reading-unit">A</span>
          </span>
        </div>
        <div className="reading-item">
          <span className="reading-label">Temperature</span>
          <span
            className={`reading-value ${isTempOk(reading.temp) ? "ok" : "bad"}`}
          >
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
                tickFormatter={(value) => value.toFixed(2)}
              />
              <YAxis
                type="number"
                dataKey="current"
                name="Current"
                unit="A"
                domain={["dataMin - 0.2", "dataMax + 0.2"]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(3) : value
                }
              />
              <Line type="monotone" dataKey="current" stroke="#00ffff" dot={{ r: 4, fill: '#00ffff' }} className="vi-line" name="Operating Point" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4 className="chart-title">Voltage & Drop History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="time" />
              <YAxis
                yAxisId="left"
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
                tickFormatter={(value) => value.toFixed(2)}
                stroke="#8884d8"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 2]}
                tickFormatter={(value) => value.toFixed(2)}
                stroke="#ffc658"
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(3) : value
                }
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="supply_v" stroke="#8884d8" name="Supply" />
              <Line yAxisId="left" type="monotone" dataKey="output_v" stroke="#82ca9d" name="Output" />
              <Line yAxisId="right" type="monotone" dataKey="voltage_drop" stroke="#ffc658" name="V Drop" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h4 className="chart-title">Current History</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="time" />
              <YAxis
                domain={["dataMin - 0.1", "dataMax + 0.1"]}
                tickFormatter={(value) => value.toFixed(2)}
              />
              <Tooltip
                formatter={(value) =>
                  typeof value === "number" ? value.toFixed(3) : value
                }
              />
              <Legend />
              <Line type="monotone" dataKey="current" stroke="#ff7300" name="Current (A)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
