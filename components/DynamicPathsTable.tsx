"use client";

import { useState, useMemo } from "react";
import { DynamicDecisionPath } from "@/lib/types";
import { ChevronUp, ChevronDown, Search, ChevronRight } from "lucide-react";

interface DynamicPathsTableProps {
  paths: DynamicDecisionPath[];
}

type SortKey = "path_id" | "rule_rank" | "rule_name" | "profile" | "state";
type SortDirection = "asc" | "desc";

export default function DynamicPathsTable({ paths }: DynamicPathsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rule_rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<number>>(new Set());

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const togglePath = (pathId: number) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(pathId)) {
      newExpanded.delete(pathId);
    } else {
      newExpanded.add(pathId);
    }
    setExpandedPaths(newExpanded);
  };

  const filteredAndSortedPaths = useMemo(() => {
    let filtered = paths;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (path) =>
          path.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.conditions_formatted?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Object.values(path.conditions).some((val) =>
            val.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return sorted;
  }, [paths, sortKey, sortDirection, searchTerm]);

  const SortButton = ({ columnKey, label }: { columnKey: SortKey; label: string }) => (
    <button
      onClick={() => handleSort(columnKey)}
      className="flex items-center gap-1 hover:text-blue-400 transition-colors"
    >
      {label}
      {sortKey === columnKey && (
        sortDirection === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
      )}
    </button>
  );

  const getAttributeColor = (attrName: string) => {
    if (attrName.includes("Tenant")) return "text-yellow-300 bg-yellow-900/30 border-yellow-700/50";
    if (attrName.includes("VLAN") || attrName.includes("vlan")) return "text-cyan-300 bg-cyan-900/30 border-cyan-700/50";
    if (attrName.includes("Zone") || attrName.includes("Network")) return "text-purple-300 bg-purple-900/30 border-purple-700/50";
    if (attrName.includes("Radius")) return "text-blue-300 bg-blue-900/30 border-blue-700/50";
    if (attrName.includes("Identity")) return "text-green-300 bg-green-900/30 border-green-700/50";
    return "text-slate-300 bg-slate-800 border-slate-600";
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Showing {filteredAndSortedPaths.length} of {paths.length} paths
      </div>

      {/* Paths List */}
      <div className="space-y-2">
        {filteredAndSortedPaths.map((path) => {
          const isExpanded = expandedPaths.has(path.path_id);
          const conditionCount = Object.keys(path.conditions).length;

          return (
            <div
              key={path.path_id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => togglePath(path.path_id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-slate-700/30 transition-colors text-left"
              >
                <div className="flex-shrink-0">
                  <ChevronRight
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-slate-500">Path #{path.path_id}</div>
                    <div className="text-sm text-slate-200 font-semibold">{path.rule_name}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Profile</div>
                    <div className="text-sm text-blue-400">{path.profile}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Rank</div>
                    <div className="text-sm text-slate-300 font-mono">{path.rule_rank}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Conditions</div>
                    <div className="text-sm text-purple-400">{conditionCount} attributes</div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      path.state === "enabled"
                        ? "bg-green-900/50 text-green-300 border border-green-700"
                        : "bg-gray-700 text-gray-400 border border-gray-600"
                    }`}
                  >
                    {path.state.toUpperCase()}
                  </span>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-slate-700 p-4 bg-slate-900">
                  <div className="space-y-4">
                    {/* Conditions */}
                    {conditionCount > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-slate-300 mb-2">Conditions:</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(path.conditions).map(([attr, value]) => (
                            <div
                              key={attr}
                              className={`p-2 rounded border ${getAttributeColor(attr)}`}
                            >
                              <div className="text-xs opacity-75">{attr}</div>
                              <div className="text-sm font-semibold mt-0.5">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formatted Conditions */}
                    {path.conditions_formatted && (
                      <div>
                        <div className="text-sm font-semibold text-slate-300 mb-2">Formatted:</div>
                        <div className="text-sm text-slate-300 bg-slate-800 p-3 rounded border border-slate-700 font-mono">
                          {path.conditions_formatted}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex gap-4 text-xs text-slate-500">
                      <div>Rule ID: <span className="text-slate-400 font-mono">{path.rule_id}</span></div>
                      {path.default && (
                        <div className="text-yellow-400">DEFAULT RULE</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
