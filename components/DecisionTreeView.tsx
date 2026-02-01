"use client";

import { useState } from "react";
import { useData } from "@/lib/DataContext";
import SummarySection from "./SummarySection";
import MermaidFlowchart from "./MermaidFlowchart";
import PathsTable from "./PathsTable";
import OtherRulesSection from "./OtherRulesSection";
import TreeStructureExplorer from "./TreeStructureExplorer";
import { BarChart3, GitBranch, List, FileText, Network } from "lucide-react";

type TabType = "summary" | "flowchart" | "paths" | "tree" | "other-rules";

export default function DecisionTreeView() {
  const { decisionTreeData } = useData();
  const [activeTab, setActiveTab] = useState<TabType>("summary");

  console.log("DecisionTreeView render - decisionTreeData:", decisionTreeData ? "present" : "null");

  if (!decisionTreeData) {
    console.log("No decision tree data, showing empty state");
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">No decision tree data available</div>
      </div>
    );
  }

  console.log("Rendering decision tree view with tabs");

  const tabs = [
    { id: "summary" as TabType, label: "Summary", icon: BarChart3 },
    { id: "flowchart" as TabType, label: "Flowchart", icon: GitBranch },
    { id: "paths" as TabType, label: "Paths", icon: List, badge: decisionTreeData.paths.length },
    { id: "tree" as TabType, label: "Tree Structure", icon: Network },
    { id: "other-rules" as TabType, label: "Other Rules", icon: FileText, badge: decisionTreeData.other_rules?.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Decision Tree Analysis</h1>
          <p className="text-slate-400">
            Visualize and explore authorization policy decision paths
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== undefined && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "summary" && <SummarySection summary={decisionTreeData.summary} />}

          {activeTab === "flowchart" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Authorization Flow Diagram</h2>
                <p className="text-sm text-slate-400">
                  Interactive flowchart showing all decision paths through the authorization policies
                </p>
              </div>
              <MermaidFlowchart chart={decisionTreeData.mermaid_flowchart} />
            </div>
          )}

          {activeTab === "paths" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Decision Paths</h2>
                <p className="text-sm text-slate-400">
                  All possible paths through the decision tree with their conditions and outcomes
                </p>
              </div>
              <PathsTable paths={decisionTreeData.paths} />
            </div>
          )}

          {activeTab === "tree" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">Tree Structure</h2>
                <p className="text-sm text-slate-400">
                  Interactive hierarchical view of the decision tree structure
                </p>
              </div>
              <TreeStructureExplorer tree={decisionTreeData.tree_structure} />
            </div>
          )}

          {activeTab === "other-rules" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  Other Rules ({decisionTreeData.other_rules?.length || 0})
                </h2>
                <p className="text-sm text-slate-400">
                  Rules that don't use endpoint attributes for decision making
                </p>
              </div>
              <OtherRulesSection rules={decisionTreeData.other_rules || []} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
