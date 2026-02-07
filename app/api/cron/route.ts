import { supabase } from "@/app/supabase";
import { sendDiscordAlert } from "@/utils/discord";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("active", true);

  if (!monitors || monitors.length === 0)
    return NextResponse.json({ error: "No monitors found" });

  const results = await Promise.all(
    monitors.map(async (monitor) => {
      const startTime = performance.now();
      let newStatus = "DOWN";
      let httpCode = 0;
      let latency = 0;

      try {
        const response = await fetch(monitor.url, {
          method: "GET",
          headers: {
            "User-Agent": "StatusPulse-Cron/1.0",
          },
          cache: "no-store",
        });

        httpCode = response.status;
        if (response.ok) newStatus = "UP";
      } catch (error) {
        httpCode = 500;
        newStatus = "DOWN";
      }

      const endTime = performance.now();
      latency = Math.round(endTime - startTime);

      if (monitor.status === "UP" && newStatus === "DOWN") {
        const alertSent = await sendDiscordAlert(
          monitor.name,
          monitor.url,
          `Status Code: ${httpCode}`,
        );
        console.log(
          `Alert for ${monitor.name}: ${alertSent ? "Sent" : "Failed"}`,
        );
      }

      await supabase.from("pings").insert({
        monitor_id: monitor.id,
        latency: latency,
        status: httpCode,
      });

      await supabase
        .from("monitors")
        .update({ status: newStatus, last_checked: new Date().toISOString() })
        .eq("id", monitor.id);

      return {
        id: monitor.id,
        url: monitor.url,
        status: newStatus,
        latency,
      };
    }),
  );

  return NextResponse.json({ success: true, checked: results.length, results });
}
