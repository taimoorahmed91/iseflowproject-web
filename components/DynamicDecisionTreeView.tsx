"use client";

import { useState } from "react";
import { useData } from "@/lib/DataContext";
import GlobalSummary from "./GlobalSummary";
import SummarySection from "./SummarySection";
import MermaidFlowchart from "./MermaidFlowchart";
import DynamicPathsTable from "./DynamicPathsTable";
import RulesSection from "./RulesSection";
import { BarChart3, GitBranch, List, FileText } from "lucide-react";

type TabType = "global" | "summary" | "flowchart" | "paths" | "rules";

export default function DynamicDecisionTreeView() {
  const { decisionTreeData } = useData();
  const [activeTab, setActiveTab] = useState<TabType>("global");
  const [selectedPolicySet, setSelectedPolicySet] = useState<string | null>(null);

  if (!decisionTreeData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400">No decision tree data available</div>
      </div>
    );
  }

  // Initialize selected policy set if not set
  const policySetNames = Object.keys(decisionTreeData.policy_sets);
  const currentPolicySet = selectedPolicySet || policySetNames[0];
  if (!selectedPolicySet && policySetNames.length > 0) {
    setSelectedPolicySet(policySetNames[0]);
  }

  const policySetData = decisionTreeData.policy_sets[currentPolicySet];

  const tabs = [
    { id: "global" as TabType, label: "Overview", icon: BarChart3 },
    { id: "summary" as TabType, label: "Summary", icon: BarChart3 },
    { id: "flowchart" as TabType, label: "Flowchart", icon: GitBranch },
    { id: "paths" as TabType, label: "Paths", icon: List, badge: policySetData?.paths.length || 0 },
    { id: "rules" as TabType, label: "Rules", icon: FileText, badge: policySetData?.rules.length || 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 mb-2">Decision Tree Analysis</h1>
          <p className="text-slate-400">
            Analyze authorization policy decision paths across {policySetNames.length} policy sets
          </p>
        </div>

        {/* Policy Set Selector */}
        {policySetNames.length > 1 && activeTab !== "global" && (
          <div className="mb-6">
            <div className="text-sm text-slate-400 mb-2">Policy Set:</div>
            <div className="flex gap-2 flex-wrap">
              {policySetNames.map((psName) => (
                <button
                  key={psName}
                  onClick={() => setSelectedPolicySet(psName)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPolicySet === psName
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {psName}
                </button>
              ))}
            </div>
          </div>
        )}

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
                {tab.badge !== undefined && tab.id !== "global" && (
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
          {activeTab === "global" && <GlobalSummary data={decisionTreeData} />}

          {activeTab === "summary" && policySetData && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  {currentPolicySet} - Summary
                </h2>
                <p className="text-sm text-slate-400">
                  Decision tree analysis for this policy set
                </p>
              </div>
              <SummarySection summary={policySetData.summary} />
            </div>
          )}

          {activeTab === "flowchart" && policySetData && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  {currentPolicySet} - Authorization Flow
                </h2>
                <p className="text-sm text-slate-400">
                  Interactive flowchart showing all decision paths
                </p>
              </div>
              {policySetData.mermaid_flowchart ? (
                <MermaidFlowchart chart={policySetData.mermaid_flowchart} />
              ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                  No flowchart available for this policy set
                </div>
              )}
            </div>
          )}

          {activeTab === "paths" && policySetData && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  {currentPolicySet} - Decision Paths
                </h2>
                <p className="text-sm text-slate-400">
                  All possible paths through the decision tree
                </p>
              </div>
              {policySetData.paths.length > 0 ? (
                <DynamicPathsTable paths={policySetData.paths} />
              ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
                  No paths available for this policy set
                </div>
              )}
            </div>
          )}

          {activeTab === "rules" && policySetData && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-200 mb-2">
                  {currentPolicySet} - Rules ({policySetData.rules.length})
                </h2>
                <p className="text-sm text-slate-400">
                  All authorization rules in this policy set
                </p>
              </div>
              <RulesSection rules={policySetData.rules} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
