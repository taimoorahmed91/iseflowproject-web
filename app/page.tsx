"use client";

import { useData } from "@/lib/DataContext";
import IdleState from "@/components/IdleState";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import PolicySetList from "@/components/PolicySetList";
import DecisionTreeView from "@/components/DecisionTreeView";
import { Layers, GitBranch } from "lucide-react";

export default function Home() {
  const { state, error, viewMode, setViewMode, data, decisionTreeData } = useData();

  console.log("Home render - state:", state, "viewMode:", viewMode, "hasData:", data !== null, "hasDecisionTree:", decisionTreeData !== null);

  if (error) {
    return <ErrorState error={error} />;
  }

  if (state === "idle") {
    return <IdleState />;
  }

  if (state === "loading") {
    return <LoadingState />;
  }

  if (state === "displaying") {
    const hasData = data !== null;
    const hasDecisionTree = decisionTreeData !== null;

    console.log("Displaying - hasData:", hasData, "hasDecisionTree:", hasDecisionTree, "viewMode:", viewMode);

    // If both datasets are loaded, show tabs
    if (hasData && hasDecisionTree) {
      return (
        <div className="min-h-screen bg-slate-900">
          {/* Tabs Header */}
          <div className="sticky top-0 z-40 bg-slate-900 border-b border-slate-700 shadow-lg">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-slate-100">ISE Policy Visualizer</h1>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => setViewMode("policy-sets")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "policy-sets"
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Policy Sets
                  </button>
                  <button
                    onClick={() => setViewMode("decision-tree")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      viewMode === "decision-tree"
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <GitBranch className="w-4 h-4" />
                    Decision Tree
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {viewMode === "policy-sets" ? <PolicySetList /> : <DecisionTreeView />}
          </div>
        </div>
      );
    }

    // Show only the available view
    if (hasDecisionTree) {
      return <DecisionTreeView />;
    }

    return <PolicySetList />;
  }

  return null;
}
