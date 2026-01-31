"use client";

import { Condition } from "@/lib/types";

interface ConditionRendererProps {
  condition: Condition | null;
  compact?: boolean;
}

export default function ConditionRenderer({ condition, compact = false }: ConditionRendererProps) {
  if (!condition) {
    return <span className="text-slate-400 italic">(always matches)</span>;
  }

  return <ConditionNode condition={condition} depth={0} compact={compact} />;
}

function ConditionNode({
  condition,
  depth,
  compact,
}: {
  condition: Condition;
  depth: number;
  compact: boolean;
}) {
  const indent = depth > 0 ? `${depth * 1.5}rem` : "0";

  // Simple condition (Library or inline)
  if (
    condition.conditionType === "ConditionAttributes" ||
    condition.conditionType === "LibraryConditionAttributes"
  ) {
    // If it's a library condition with a name, show that
    if (condition.conditionType === "LibraryConditionAttributes" && condition.name && compact) {
      return (
        <div style={{ marginLeft: indent }} className="text-slate-300">
          <span className="text-blue-400">{condition.name}</span>
          {condition.description && (
            <span className="text-slate-500 text-xs ml-2">({condition.description})</span>
          )}
        </div>
      );
    }

    return (
      <div style={{ marginLeft: indent }} className="font-mono text-sm">
        {condition.isNegate && <span className="text-red-400 font-bold mr-1">NOT</span>}
        <span className="text-cyan-400">{condition.dictionaryName}</span>
        <span className="text-slate-500">.</span>
        <span className="text-green-400">{condition.attributeName}</span>
        <span className="text-yellow-500 mx-2">{condition.operator?.toUpperCase()}</span>
        <span className="text-purple-400">{condition.attributeValue}</span>
      </div>
    );
  }

  // AND Block
  if (condition.conditionType === "ConditionAndBlock") {
    return (
      <div style={{ marginLeft: indent }} className="space-y-2">
        {condition.isNegate && (
          <div className="text-red-400 font-bold text-sm">NOT (</div>
        )}
        {condition.children && condition.children.length > 0 ? (
          condition.children.map((child, index) => (
            <div key={index}>
              <ConditionNode condition={child} depth={depth + 1} compact={compact} />
              {index < condition.children!.length - 1 && (
                <div
                  style={{ marginLeft: `${(depth + 1) * 1.5}rem` }}
                  className="text-yellow-500 font-bold text-sm my-1"
                >
                  AND
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic">(empty AND block)</div>
        )}
        {condition.isNegate && <div className="text-red-400 font-bold text-sm">)</div>}
      </div>
    );
  }

  // OR Block
  if (condition.conditionType === "ConditionOrBlock") {
    return (
      <div style={{ marginLeft: indent }} className="space-y-2">
        {condition.isNegate && (
          <div className="text-red-400 font-bold text-sm">NOT (</div>
        )}
        {condition.children && condition.children.length > 0 ? (
          condition.children.map((child, index) => (
            <div key={index}>
              <ConditionNode condition={child} depth={depth + 1} compact={compact} />
              {index < condition.children!.length - 1 && (
                <div
                  style={{ marginLeft: `${(depth + 1) * 1.5}rem` }}
                  className="text-orange-500 font-bold text-sm my-1"
                >
                  OR
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-slate-500 italic">(empty OR block)</div>
        )}
        {condition.isNegate && <div className="text-red-400 font-bold text-sm">)</div>}
      </div>
    );
  }

  // Unknown condition type
  return (
    <div style={{ marginLeft: indent }} className="text-red-400 italic">
      (unknown condition type: {condition.conditionType})
    </div>
  );
}

// Utility function to render condition as a single-line summary
export function renderConditionSummary(condition: Condition | null): string {
  if (!condition) return "(always matches)";

  if (
    condition.conditionType === "ConditionAttributes" ||
    condition.conditionType === "LibraryConditionAttributes"
  ) {
    if (condition.conditionType === "LibraryConditionAttributes" && condition.name) {
      return condition.name;
    }
    return `${condition.dictionaryName}.${condition.attributeName} ${condition.operator} ${condition.attributeValue}`;
  }

  if (condition.conditionType === "ConditionAndBlock") {
    const count = condition.children?.length || 0;
    return `AND Block (${count} condition${count !== 1 ? "s" : ""})`;
  }

  if (condition.conditionType === "ConditionOrBlock") {
    const count = condition.children?.length || 0;
    return `OR Block (${count} condition${count !== 1 ? "s" : ""})`;
  }

  return "(complex condition)";
}
