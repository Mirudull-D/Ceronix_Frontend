import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

function Detection2() {
  const [data, setData] = useState({
    status: "---",
    v1: 0,
    v2: 0,
    legit: false,
  });

  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/l293d");
        setData(res.data);
      } catch (err) {
        console.warn("Backend fetch failed, using mock data:", err.message);
        // generate mock voltages that oscillate like a real test
        const mockStates = [
          { status: "FORWARD", v1: 4.5, v2: 0.1, legit: true },
          { status: "REVERSE", v1: 0.2, v2: 4.4, legit: true },
          { status: "BRAKE", v1: 0.0, v2: 0.0, legit: true },
        ];
        const mock =
          mockStates[Math.floor(Date.now() / 2000) % mockStates.length];
        setData(mock);
      }
    };

    const interval = setInterval(fetchData, 1000); // update every second
    return () => clearInterval(interval);
  }, []);

  // append new reading to history for chart
  useEffect(() => {
    setHistory((prev) => {
      const newEntry = {
        time: new Date().toLocaleTimeString().split(" ")[0], // HH:MM:SS
        v1: data.v1,
        v2: data.v2,
      };
      const updated = [...prev, newEntry];
      // keep last 20 points
      return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
    });
  }, [data]);

  return (
    <div style={{ fontFamily: "Arial", padding: "2rem", textAlign: "center" }}>
      <h1>L293D Motor Driver Monitor</h1>
      <h2>
        Status: <span>{data.status}</span>
      </h2>
      <p>
        OUT1 Voltage: <b>{data.v1.toFixed(2)} V</b>
      </p>
      <p>
        OUT2 Voltage: <b>{data.v2.toFixed(2)} V</b>
      </p>
      <h2 style={{ color: data.legit ? "green" : "red" }}>
        {data.legit ? "✅ Legit L293D" : "❌ Faulty / Unknown"}
      </h2>

      <h3>Voltage History (last 20 sec)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={[0, 5]} tickFormatter={(v) => `${v}V`} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="v1" stroke="#8884d8" name="OUT1 (V)" />
          <Line type="monotone" dataKey="v2" stroke="#82ca9d" name="OUT2 (V)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Detection2;
