"use client";

import { DecisionTreeData } from "@/lib/types";

interface SummarySectionProps {
  summary: DecisionTreeData["summary"];
}

export default function SummarySection({ summary }: SummarySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-1">Total Rules</div>
        <div className="text-3xl font-bold text-blue-400">{summary.total_rules}</div>
      </div>

      {/* Endpoint Attribute Rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-1">Endpoint Attribute Rules</div>
        <div className="text-3xl font-bold text-green-400">{summary.endpoint_attribute_rules}</div>
      </div>

      {/* Other Rules */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-1">Other Rules</div>
        <div className="text-3xl font-bold text-orange-400">{summary.other_rules}</div>
      </div>

      {/* Unique Values Summary */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="text-sm text-slate-400 mb-2">Unique Values</div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-300">rVLAN:</span>
            <span className="text-cyan-400 font-semibold">{summary.unique_values.rVLAN?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">NetworkZone:</span>
            <span className="text-purple-400 font-semibold">{summary.unique_values.NetworkZone?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-300">Tenant:</span>
            <span className="text-yellow-400 font-semibold">{summary.unique_values.Tenant?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Unique Values Details */}
      <div className="md:col-span-2 lg:col-span-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="text-sm font-semibold text-slate-300 mb-3">Unique Attribute Values</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* rVLAN */}
          {summary.unique_values.rVLAN && summary.unique_values.rVLAN.length > 0 && (
            <div>
              <div className="text-xs text-cyan-400 font-semibold mb-2">rVLAN ({summary.unique_values.rVLAN.length})</div>
              <div className="flex flex-wrap gap-1">
                {summary.unique_values.rVLAN.map((value, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded border border-cyan-700/50"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NetworkZone */}
          {summary.unique_values.NetworkZone && summary.unique_values.NetworkZone.length > 0 && (
            <div>
              <div className="text-xs text-purple-400 font-semibold mb-2">NetworkZone ({summary.unique_values.NetworkZone.length})</div>
              <div className="flex flex-wrap gap-1">
                {summary.unique_values.NetworkZone.map((value, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded border border-purple-700/50"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tenant */}
          {summary.unique_values.Tenant && summary.unique_values.Tenant.length > 0 && (
            <div>
              <div className="text-xs text-yellow-400 font-semibold mb-2">Tenant ({summary.unique_values.Tenant.length})</div>
              <div className="flex flex-wrap gap-1">
                {summary.unique_values.Tenant.map((value, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded border border-yellow-700/50"
                  >
                    {value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
