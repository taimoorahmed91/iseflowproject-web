"use client";

import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-6">
        <h2 className="text-slate-200 text-2xl font-semibold">New request received</h2>
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
        <p className="text-slate-400 text-lg">Fetching data from GitHub...</p>
      </div>
    </div>
  );
}
