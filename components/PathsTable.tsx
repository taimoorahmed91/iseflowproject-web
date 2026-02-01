"use client";

import { useState, useMemo } from "react";
import { DynamicDecisionPath } from "@/lib/types";
import { ChevronUp, ChevronDown, Search } from "lucide-react";

interface PathsTableProps {
  paths: DynamicDecisionPath[];
}

type SortKey = "path_id" | "rule_rank" | "rule_name" | "profile" | "state";
type SortDirection = "asc" | "desc";

export default function PathsTable({ paths }: PathsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rule_rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAttribute, setFilterAttribute] = useState<"all" | "rVLAN" | "NetworkZone" | "Tenant">("all");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const filteredAndSortedPaths = useMemo(() => {
    let filtered = paths;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (path) =>
          path.rule_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.policy_set.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.rVLAN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.NetworkZone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          path.Tenant?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply attribute filter
    if (filterAttribute !== "all") {
      filtered = filtered.filter((path) => path[filterAttribute] !== undefined && path[filterAttribute] !== null);
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
  }, [paths, sortKey, sortDirection, searchTerm, filterAttribute]);

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
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

        {/* Attribute Filter */}
        <select
          value={filterAttribute}
          onChange={(e) => setFilterAttribute(e.target.value as any)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Attributes</option>
          <option value="rVLAN">Has rVLAN</option>
          <option value="NetworkZone">Has NetworkZone</option>
          <option value="Tenant">Has Tenant</option>
        </select>
      </div>

      {/* Results Count */}
      <div className="text-sm text-slate-400">
        Showing {filteredAndSortedPaths.length} of {paths.length} paths
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="path_id" label="Path ID" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="rVLAN" label="rVLAN" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="NetworkZone" label="NetworkZone" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="Tenant" label="Tenant" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="rule_name" label="Rule" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="rule_rank" label="Rank" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="profile" label="Profile" />
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-300">
                <SortButton columnKey="policy_set" label="Policy Set" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedPaths.map((path, idx) => (
              <tr
                key={path.path_id}
                className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{path.path_id}</td>
                <td className="py-3 px-4">
                  {path.rVLAN ? (
                    <span className="px-2 py-1 bg-cyan-900/30 text-cyan-300 text-xs rounded">
                      {path.rVLAN}
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {path.NetworkZone ? (
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-300 text-xs rounded">
                      {path.NetworkZone}
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {path.Tenant ? (
                    <span className="px-2 py-1 bg-yellow-900/30 text-yellow-300 text-xs rounded">
                      {path.Tenant}
                    </span>
                  ) : (
                    <span className="text-slate-600">-</span>
                  )}
                </td>
                <td className="py-3 px-4 text-slate-200">{path.rule_name}</td>
                <td className="py-3 px-4 text-slate-300 font-mono">{path.rule_rank}</td>
                <td className="py-3 px-4 text-blue-400">{path.profile}</td>
                <td className="py-3 px-4 text-slate-300">{path.policy_set}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
