"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "../app/supabase";

export async function checkMonitor(id: number, url: string) {
  const startTime = performance.now();
  let status = "DOWN";
  let httpCode = 0;
  let latency = 0;

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        "User-Agent": "StatusPulse-Monitor/1.0",
      },
    });

    const endTime = performance.now();
    latency = Math.round(endTime - startTime);
    httpCode = response.status;

    if (response.ok) {
      status = "UP";
    } else {
      status = "DOWN";
    }
  } catch (error) {
    const endTime = performance.now();
    latency = Math.round(endTime - startTime);
    status = "DOWN";
    httpCode = 500;
  }

  await supabase
    .from("monitors")
    .update({
      status: status,
      last_checked: new Date().toISOString(),
    })
    .eq("id", id);

  await supabase.from("pings").insert({
    monitor_id: id,
    latency: latency,
    status: httpCode,
  });

  revalidatePath("/");

  return {
    success: true,
    status,
    latency,
  };
}

export async function createMonitor(formData: FormData) {
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name || !url) return { error: "Name and URL are required." };

  const { error } = await supabase.from("monitors").insert({
    name: name,
    url: url,
    active: true,
    status: "PENDING",
  });

  if (error) return { error: "Failed to create monitor." };

  revalidatePath("/");

  return { success: true };
}
