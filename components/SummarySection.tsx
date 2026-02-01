"use client";

import { PolicySetAnalysis } from "@/lib/types";

interface SummarySectionProps {
  summary: PolicySetAnalysis["summary"];
}

export default function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Total Rules</div>
          <div className="text-3xl font-bold text-blue-400">{summary.total_rules}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Attributes Used</div>
          <div className="text-3xl font-bold text-purple-400">{summary.attributes_used.length}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Hierarchy Depth</div>
          <div className="text-3xl font-bold text-green-400">{summary.hierarchy.length}</div>
        </div>
      </div>

      {/* Decision Hierarchy */}
      {summary.hierarchy.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Decision Hierarchy</h3>
          <div className="flex flex-wrap items-center gap-2">
            {summary.hierarchy.map((attr, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="px-3 py-2 bg-blue-900/30 text-blue-300 rounded-lg border border-blue-700/50 font-mono text-sm">
                  {idx + 1}. {attr}
                </div>
                {idx < summary.hierarchy.length - 1 && (
                  <div className="text-slate-600 text-xl">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attribute Frequency */}
      {Object.keys(summary.attribute_frequency).length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Attribute Usage Frequency</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(summary.attribute_frequency)
              .sort(([, a], [, b]) => b - a)
              .map(([attr, count]) => (
                <div key={attr} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                  <div className="text-sm font-semibold text-slate-200">{attr}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Used in <span className="text-cyan-400 font-semibold">{count}</span> rules
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Unique Values Per Attribute */}
      {Object.keys(summary.unique_values_per_attribute).length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Unique Values Per Attribute</h3>
          <div className="space-y-4">
            {Object.entries(summary.unique_values_per_attribute).map(([attr, values]) => (
              <div key={attr} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="text-sm font-semibold text-cyan-400 mb-2">
                  {attr} ({values.length} unique values)
                </div>
                <div className="flex flex-wrap gap-2">
                  {values.map((value, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-800 text-slate-300 text-xs rounded border border-slate-600"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
