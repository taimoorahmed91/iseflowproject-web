"use client";

import { useData } from "@/lib/DataContext";
import { PolicySet } from "@/lib/types";

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
        <span className="text-sm text-slate-300">
          {policySet.condition ? renderConditionSummary(policySet.condition) : "(always matches)"}
        </span>
      </div>

      <div className="flex gap-3">
        <a
          href={`/flowchart/${policySet.id}/auth`}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
        >
          View Auth Flow ({policySet.authentication_policies.length})
        </a>
        <a
          href={`/flowchart/${policySet.id}/authz`}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors"
        >
          View Authz Flow ({policySet.authorization_policies.length})
        </a>
      </div>
    </div>
  );
}

function renderConditionSummary(condition: any): string {
  if (!condition) return "(always matches)";

  if (condition.conditionType === "LibraryConditionAttributes" && condition.name) {
    return condition.name;
  }

  if (
    condition.conditionType === "ConditionAttributes" ||
    condition.conditionType === "LibraryConditionAttributes"
  ) {
    return `${condition.dictionaryName}.${condition.attributeName} ${condition.operator} ${condition.attributeValue}`;
  }

  if (condition.conditionType === "ConditionAndBlock") {
    return `AND Block (${condition.children?.length || 0} conditions)`;
  }

  if (condition.conditionType === "ConditionOrBlock") {
    return `OR Block (${condition.children?.length || 0} conditions)`;
  }

  return "(complex condition)";
}
