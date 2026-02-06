"use client";

import { Ping } from "@/types/ping";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LatencyChart({ data }: { data: Ping[] }) {
  const chartData = [...data].reverse().map((item) => ({
    time: new Date(item.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    latency: item.latency,
    status: item.status,
    fulldate: new Date(item.created_at).toLocaleString(),
  }));

  if (data.length < 2) {
    return (
      <div className="h-[300px] flex items-center justify-center border border-slate-800 rounded-lg bg-slate-900 text-slate-500">
        Butuh minimal 2 data ping untuk menampilkan grafik.
      </div>
    );
  }

  return (
    <div className="h-[350px] w-full bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-slate-400 mb-4">
        Response Time (ms)
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="time"
            stroke="#64748b"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value}ms`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#334155",
              color: "#f1f5f9",
            }}
            itemStyle={{ color: "#34d399" }}
            labelStyle={{ color: "#94a3b8", marginBottom: "0.5rem" }}
          />
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorLatency)"
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
