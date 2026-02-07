import { Monitor } from "@/types/monitor";
import { supabase } from "./supabase";
import MonitorCard from "@/components/MonitorCard";
import AddMonitor from "@/components/AddMonitor";

export const revalidate = 0;

export default async function Home() {
  const { data: monitors, error } = await supabase
    .from("monitors")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.log("Error fetching monitors:", error);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <span className="text-emerald-400">Status</span>Pulse
            </h1>
            <p className="text-slate-400 mt-1">Real-time uptime monitoring</p>
          </div>
          <AddMonitor />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {monitors?.map((monitor: Monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}

          {(!monitors || monitors.length === 0) && (
            <p className="col-span-full text-center text-slate-500 py-10">
              Belum ada monitor. Silakan tambahkan satu.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
