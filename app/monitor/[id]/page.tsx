import { supabase } from "@/app/supabase";
import LatencyChart from "@/components/LatencyChart";
import { deleteMonitor } from "@/hooks/action";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

type Params = Promise<{ id: string }>;

export default async function MonitorDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const { data: monitor } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .single();

  const { data: pings } = await supabase
    .from("pings")
    .select("*")
    .eq("monitor_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!monitor) return <div className="text-white p-8">Monitor not found.</div>;

  async function handleDelete() {
    "use server";
    await deleteMonitor(parseInt(id));
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-slate-400 hover:text-white mb-6 gap-2 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Header Detail */}
        <div className="flex justify-between items-start mb-8 bg-slate-900 p-6 rounded-lg border border-slate-800">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {monitor.name}
              <span
                className={`text-xs px-2 py-1 rounded-full border ${
                  monitor.status === "UP"
                    ? "bg-emerald-950 text-emerald-400 border-emerald-900"
                    : "bg-red-950 text-red-400 border-red-900"
                }`}
              >
                {monitor.status}
              </span>
            </h1>
            <a
              href={monitor.url}
              target="_blank"
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-2"
            >
              <Globe className="w-4 h-4" /> {monitor.url}
            </a>
          </div>

          <form action={handleDelete}>
            <button className="bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900 px-4 py-2 rounded-md flex items-center gap-2 transition text-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </form>
        </div>

        <div className="mb-8">
          <LatencyChart data={pings || []} />
        </div>

        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" /> Recent Activity (Last 20 Pings)
        </h2>

        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pings?.map((ping) => (
                <tr key={ping.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4">
                    {new Date(ping.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                        ping.status >= 200 && ping.status < 300
                          ? "text-emerald-400 bg-emerald-950/30"
                          : "text-red-400 bg-red-950/30"
                      }`}
                    >
                      {ping.status >= 200 && ping.status < 300 ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {ping.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">
                    {ping.latency} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(!pings || pings.length === 0) && (
            <div className="p-8 text-center text-slate-500">
              No history pings available yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
