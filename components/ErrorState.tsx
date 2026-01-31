"use client";

import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h2 className="text-red-400 text-xl font-semibold">Error Loading Data</h2>
        <p className="text-slate-300">{error}</p>
        <p className="text-slate-500 text-sm">
          Please check the data URL and try again, or contact Taimoor for assistance.
        </p>
      </div>
    </div>
  );
}
