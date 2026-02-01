"use client";

import { DecisionTreeData } from "@/lib/types";

interface GlobalSummaryProps {
  data: DecisionTreeData;
}

export default function GlobalSummary({ data }: GlobalSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Metadata */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Analysis Metadata</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Generated:</span>
            <span className="text-slate-300 ml-2">
              {new Date(data.metadata.generated_at).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Total Policy Sets:</span>
            <span className="text-blue-400 ml-2 font-semibold">{data.metadata.total_policy_sets}</span>
          </div>
          <div>
            <span className="text-slate-500">Total Rules:</span>
            <span className="text-green-400 ml-2 font-semibold">{data.metadata.total_rules}</span>
          </div>
          <div>
            <span className="text-slate-500">Unique Attributes:</span>
            <span className="text-purple-400 ml-2 font-semibold">
              {data.global_summary.total_unique_attributes}
            </span>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Policy Sets Analyzed</div>
          <div className="text-3xl font-bold text-blue-400">{data.global_summary.policy_sets_analyzed}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Total Attributes</div>
          <div className="text-3xl font-bold text-purple-400">{data.discovered_attributes.all_attributes.length}</div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
          <div className="text-sm text-slate-400 mb-1">Total Rules</div>
          <div className="text-3xl font-bold text-green-400">{data.metadata.total_rules}</div>
        </div>
      </div>

      {/* Most Common Attributes */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Most Common Attributes</h3>
        <div className="flex flex-wrap gap-2">
          {data.global_summary.most_common_attributes.map((attr, idx) => (
            <div
              key={idx}
              className="px-3 py-2 bg-blue-900/30 text-blue-300 rounded-lg border border-blue-700/50 text-sm"
            >
              <div className="font-semibold">{attr}</div>
              <div className="text-xs text-blue-400/70">
                Used {data.discovered_attributes.attribute_frequency[attr]} times
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Attributes */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">
          All Discovered Attributes ({data.discovered_attributes.all_attributes.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.discovered_attributes.all_attributes.map((attr, idx) => {
            const values = data.discovered_attributes.attribute_values[attr] || [];
            const frequency = data.discovered_attributes.attribute_frequency[attr] || 0;

            return (
              <div key={idx} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                <div className="text-sm font-semibold text-slate-200 mb-2">{attr}</div>
                <div className="text-xs text-slate-400 mb-2">
                  Frequency: <span className="text-cyan-400">{frequency}</span> |
                  Values: <span className="text-purple-400">{values.length}</span>
                </div>
                {values.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {values.slice(0, 3).map((val, vidx) => (
                      <span
                        key={vidx}
                        className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs rounded border border-slate-600"
                      >
                        {val}
                      </span>
                    ))}
                    {values.length > 3 && (
                      <span className="px-2 py-0.5 text-slate-500 text-xs">
                        +{values.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
