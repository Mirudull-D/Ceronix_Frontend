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
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>L293D Authenticity Monitor</h1>
      <p>Status: {isMock ? "⚠️ Using Mock Data" : "✅ Live from Arduino"}</p>

      <h2>
        Chip Verdict:{" "}
        <span
          style={{
            color: status.includes("FAKE") ? "red" : "green",
            fontWeight: "bold",
          }}
        >
          {status}
        </span>
      </h2>

      <h3>Latest Reading</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>Supply Voltage: {reading.supply_v.toFixed(2)} V</li>
        <li>Output Voltage: {reading.output_v.toFixed(2)} V</li>
        <li>Voltage Drop : {reading.voltage_drop.toFixed(2)} V</li>
        <li>Current : {reading.current.toFixed(2)} A</li>
        <li>Temperature : {reading.temp.toFixed(1)} °C</li>
      </ul>

      <h3>Voltage / Current / Temp History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="supply_v"
            stroke="#8884d8"
            name="Supply V"
          />
          <Line
            type="monotone"
            dataKey="output_v"
            stroke="#82ca9d"
            name="Output V"
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke="#ff7300"
            name="Current (A)"
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#ff0000"
            name="Temp (°C)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
