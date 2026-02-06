"use client";

import { checkMonitor } from "@/hooks/action";
import { Monitor } from "@/types/monitor";
import { CheckCircle2, Clock, Globe, Play, XCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MonitorProps = {
  monitor: Monitor;
};

export default function MonitorCard({ monitor }: MonitorProps) {
  const [loading, setLoading] = useState(false);

  const handlePing = async () => {
    setLoading(true);
    await checkMonitor(monitor.id, monitor.url);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition relative group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800 rounded-md">
          <Globe className="w-5 h-5 text-slate-400" />
        </div>

        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold border ${
            monitor.status === "UP"
              ? "bg-emerald-950/50 border-emerald-900 text-emerald-400"
              : monitor.status === "DOWN"
                ? "bg-red-950/50 border-red-900 text-red-400"
                : "bg-yellow-950/50 border-yellow-900 text-yellow-400"
          }`}
        >
          {monitor.status === "UP" && <CheckCircle2 className="w-3 h-3" />}
          {monitor.status === "DOWN" && <XCircle className="w-3 h-3" />}
          {monitor.status === "PENDING" && <Clock className="w-3 h-3" />}
          {monitor.status}
        </div>
      </div>

      <Link href={`/monitor/${monitor.id}`} className="hover:underline">
        <h3 className="font-semibold text-lg">{monitor.name}</h3>
      </Link>
      <a
        href={monitor.url}
        target="_blank"
        className="text-sm text-slate-500 hover:text-emerald-400 transition truncate block mb-4"
      >
        {monitor.url}
      </a>

      <button
        onClick={handlePing}
        disabled={loading}
        className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
      >
        {loading ? (
          <span className="animate-spin">⏳</span>
        ) : (
          <>
            <Play className="w-3 h-3" /> Check Now
          </>
        )}
      </button>

      {monitor.last_checked && (
        <p className="text-xs text-slate-600 mt-3 text-center">
          Last checked: {new Date(monitor.last_checked).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
