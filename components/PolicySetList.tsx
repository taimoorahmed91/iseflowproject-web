"use client";

import Link from "next/link";
import { useData } from "@/lib/DataContext";
import { PolicySet, Condition } from "@/lib/types";
import ConditionPopover from "./ConditionPopover";

export default function PolicySetList() {
  const { data } = useData();

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-100 mb-8">ISE Policy Visualizer</h1>

        {data.metadata && (
          <div className="mb-6 text-sm text-slate-500">
            Generated: {new Date(data.metadata.generated_at).toLocaleString()} |{" "}
            {data.metadata.total_policy_sets} Policy Sets |{" "}
            {data.metadata.total_authentication_policies} Auth Policies |{" "}
            {data.metadata.total_authorization_policies} Authz Policies
          </div>
        )}

        <div className="space-y-6">
          {data.policy_sets.map((policySet) => (
            <PolicySetCard key={policySet.id} policySet={policySet} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PolicySetCard({ policySet }: { policySet: PolicySet }) {
  const isEnabled = policySet.state === "enabled";
  const isDefault = policySet.default;

  return (
    <div
        className={`border rounded-lg p-6 ${
          isEnabled
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-800/50 border-slate-700/50 opacity-60"
        } ${isDefault ? "ring-2 ring-yellow-600/50" : ""}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">
              {policySet.name}
              <span className="ml-3 text-sm text-slate-400">Rank: {policySet.rank}</span>
            </h2>
            {policySet.description && (
              <p className="text-sm text-slate-400 mt-1">{policySet.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded text-xs font-semibold ${
                isEnabled
                  ? "bg-green-900/50 text-green-300 border border-green-700"
                  : "bg-gray-700 text-gray-400 border border-gray-600"
              }`}
            >
              {policySet.state.toUpperCase()}
            </span>
            {isDefault && (
              <span className="px-3 py-1 rounded text-xs font-semibold bg-yellow-900/50 text-yellow-300 border border-yellow-700">
                DEFAULT
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <span className="text-sm text-slate-500">Condition: </span>
          <ConditionDisplay condition={policySet.condition} />
        </div>

        <div className="flex gap-3">
          <Link
            href={`/flowchart/${policySet.id}/auth`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          >
            View Auth Flow ({policySet.authentication_policies.length})
          </Link>
          <Link
            href={`/flowchart/${policySet.id}/authz`}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
          >
            View Authz Flow ({policySet.authorization_policies.length})
          </Link>
        </div>
      </div>
  );
}

interface ConditionDisplayProps {
  condition: Condition | null;
}

function ConditionDisplay({ condition }: ConditionDisplayProps) {
  if (!condition) {
    return <span className="text-sm text-slate-300 italic">(always matches)</span>;
  }

  // Library condition - shows popover on hover
  if (condition.conditionType === "LibraryConditionAttributes" && condition.name) {
    return (
      <ConditionPopover condition={condition}>
        <span className="text-sm text-blue-400 underline decoration-dotted cursor-help">
          {condition.name}
        </span>
      </ConditionPopover>
    );
  }

  // Inline condition - plain text
  if (condition.conditionType === "ConditionAttributes") {
    return (
      <span className="text-sm text-slate-300">
        {condition.dictionaryName}.{condition.attributeName} {condition.operator}{" "}
        {condition.attributeValue}
      </span>
    );
  }

  // AND/OR Block - display as text
  if (
    condition.conditionType === "ConditionAndBlock" ||
    condition.conditionType === "ConditionOrBlock"
  ) {
    const blockType = condition.conditionType === "ConditionAndBlock" ? "AND" : "OR";
    const count = condition.children?.length || 0;

    return (
      <span className="text-sm text-orange-400">
        {blockType} Block ({count} condition{count !== 1 ? "s" : ""})
      </span>
    );
  }

  return <span className="text-sm text-slate-300">(complex condition)</span>;
}
