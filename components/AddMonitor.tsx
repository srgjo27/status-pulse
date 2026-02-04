"use client";

import { createMonitor } from "@/hooks/action";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function AddMonitor() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    await createMonitor(formData);
    setLoading(false);
    setIsOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium transition flex items-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Monitor
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4">Add New Monitor</h2>

            <form action={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. My Portfolio"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">URL</label>
                <input
                  name="url"
                  type="url"
                  placeholder="https://url-to-monitor.com"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-medium disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Monitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
