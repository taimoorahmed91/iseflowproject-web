"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { useData } from "@/lib/DataContext";

export default function IdleState() {
  const { loadData } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadData(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/json") {
      await loadData(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="text-center max-w-md">
        <p className="text-slate-400 text-2xl mb-8">ISE Policy Visualizer</p>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-600 rounded-lg p-12 cursor-pointer hover:border-slate-500 hover:bg-slate-800/50 transition-colors"
        >
          <Upload className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-300 text-lg mb-2">Load Policy Data</p>
          <p className="text-slate-500 text-sm">
            Click to browse or drag and drop your<br />
            <code className="text-slate-400">processed_data.json</code> file here
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
