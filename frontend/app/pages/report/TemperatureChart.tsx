import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface TemperatureChartProps {
  reportId: string |undefined;
}

export function TemperatureChart({ reportId }: TemperatureChartProps) {
  const [data, setData] = useState<{ timeframe: string; temperature: number | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTemperatureData() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3000/factories/${reportId}/temperature`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const json: Record<number, unknown> = await response.json();

        // Convert API response to chart-friendly format
        const formattedData = Object.entries(json).map(([timeframe, temp]) => ({
          timeframe,
          temperature: typeof temp === "number" ? temp : null,
        }));

        console.log(formattedData);

        setData(formattedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchTemperatureData();
  }, [reportId]);

  if (loading) return <p>Loading temperature data...</p>;
  if (error) return <p>Error: {error}</p>;

  // Check if all temperature values are null
  const allNull = data.every((d) => d.temperature === null);
  if (allNull) return <p>No temperature data available for this factory.</p>;

  return (
    <div style={{ background: 'white', padding: '20px', borderRadius: '2px', color: '#173940' }}>
      <h3 style={{ textAlign: 'center' }}>Projected Temperature Evolution at Location</h3>

      <ResponsiveContainer width="90%" height={400}>
        <LineChart data={data}>
          {/* Dégradé pour la ligne */}
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff7300" stopOpacity={1} />
              <stop offset="100%" stopColor="#8884d8" stopOpacity={1} />
            </linearGradient>
          </defs>

          {/* Grille douce */}
          <CartesianGrid strokeDasharray="2 2" stroke="rgba(200,200,200,0.5)" />

          {/* Axe X */}
          <XAxis dataKey="timeframe" stroke="#173940" />

          {/* Axe Y avec unité */}
          <YAxis label={{ value: "°C", angle: -90, position: "insideLeft", fill: '#173940'}} stroke="#173940" domain={[15, 'auto']}/>

          {/* Tooltip stylisé */}
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', color: '#173940', borderRadius: '5px' }} 
            labelStyle={{ color: '#ff7300' }}
          />

          {/* Légende */}
          <Legend verticalAlign="top" wrapperStyle={{ color: '#173940' }} />

          {/* Ligne stylisée avec points visibles */}
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="url(#tempGradient)" // Utilisation du dégradé
            strokeWidth={2}
            dot={{ fill: '#173940', stroke: '#ff7300', strokeWidth: 1, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
