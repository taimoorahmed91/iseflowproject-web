"use client";

import { useState } from "react";
import { RuleInfo } from "@/lib/types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface RulesSectionProps {
  rules: RuleInfo[];
}

export default function RulesSection({ rules }: RulesSectionProps) {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set());

  const toggleRule = (index: number) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRules(newExpanded);
  };

  if (!rules || rules.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        No rules found
      </div>
    );
  }

  // Sort by rank
  const sortedRules = [...rules].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-3">
      {sortedRules.map((rule, idx) => {
        const isExpanded = expandedRules.has(idx);
        const isEnabled = rule.state === "enabled";
        const attributeCount = Object.keys(rule.attributes).length;

        return (
          <div
            key={idx}
            className={`border rounded-lg ${
              isEnabled
                ? "bg-slate-800 border-slate-700"
                : "bg-slate-800/50 border-slate-700/50 opacity-70"
            }`}
          >
            {/* Header */}
            <button
              onClick={() => toggleRule(idx)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-slate-200 font-semibold">{rule.name}</span>
                    <span className="text-xs text-slate-500 font-mono">Rank: {rule.rank}</span>
                    {rule.default && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                        DEFAULT
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        isEnabled
                          ? "bg-green-900/50 text-green-300 border border-green-700"
                          : "bg-gray-700 text-gray-400 border border-gray-600"
                      }`}
                    >
                      {rule.state.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Profile: <span className="text-blue-400">{rule.profile}</span>
                    {attributeCount > 0 && (
                      <span className="ml-3 text-purple-400">{attributeCount} conditions</span>
                    )}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700 mt-2 pt-3">
                {/* Attributes */}
                {attributeCount > 0 && (
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Attributes:</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(rule.attributes).map(([attr, value]) => (
                        <div
                          key={attr}
                          className="p-2 bg-slate-900 rounded border border-slate-700"
                        >
                          <div className="text-xs text-slate-400">{attr}</div>
                          <div className="text-sm text-slate-200 font-semibold mt-0.5">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formatted Conditions */}
                <div>
                  <div className="text-xs text-slate-500 mb-1">Conditions:</div>
                  <div className="text-sm text-slate-300 bg-slate-900 p-3 rounded border border-slate-700 font-mono whitespace-pre-wrap">
                    {rule.conditions_formatted || "(no conditions)"}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
