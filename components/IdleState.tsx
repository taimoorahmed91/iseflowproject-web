"use client";

import { useRef } from "react";
import { Upload, GitBranch } from "lucide-react";
import { useData } from "@/lib/DataContext";

export default function IdleState() {
  const { loadData, loadDecisionTree } = useData();
  const policyFileInputRef = useRef<HTMLInputElement>(null);
  const decisionTreeFileInputRef = useRef<HTMLInputElement>(null);

  const handlePolicyFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadData(file);
    }
  };

  const handleDecisionTreeFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await loadDecisionTree(file);
    }
  };

  const handlePolicyDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/json") {
      await loadData(file);
    }
  };

  const handleDecisionTreeDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/json") {
      await loadDecisionTree(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8">
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-slate-200 mb-3">ISE Policy Visualizer</h1>
        <p className="text-slate-400 mb-12">Load your ISE policy data or decision tree analysis</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Policy Sets Upload */}
          <div
            onDrop={handlePolicyDrop}
            onDragOver={handleDragOver}
            onClick={() => policyFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-colors"
          >
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg mb-2 font-semibold">Policy Sets</p>
            <p className="text-slate-500 text-sm">
              Load <code className="text-slate-400">processed_data.json</code>
              <br />to view policy sets and flows
            </p>
          </div>

          {/* Decision Tree Upload */}
          <div
            onDrop={handleDecisionTreeDrop}
            onDragOver={handleDragOver}
            onClick={() => decisionTreeFileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-600 rounded-lg p-8 cursor-pointer hover:border-purple-500 hover:bg-slate-800/50 transition-colors"
          >
            <GitBranch className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg mb-2 font-semibold">Decision Tree</p>
            <p className="text-slate-500 text-sm">
              Load <code className="text-slate-400">decision_tree.json</code>
              <br />to view decision paths
            </p>
          </div>
        </div>

        <input
          ref={policyFileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handlePolicyFileSelect}
          className="hidden"
        />

        <input
          ref={decisionTreeFileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleDecisionTreeFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
