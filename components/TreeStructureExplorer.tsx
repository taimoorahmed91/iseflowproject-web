"use client";

import { useState } from "react";
import { TreeNode } from "@/lib/types";
import { ChevronDown, ChevronRight, FileText, GitBranch, CheckCircle2 } from "lucide-react";

interface TreeStructureExplorerProps {
  tree: TreeNode;
}

export default function TreeStructureExplorer({ tree }: TreeStructureExplorerProps) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <TreeNodeComponent node={tree} level={0} />
    </div>
  );
}

interface TreeNodeComponentProps {
  node: TreeNode;
  level: number;
  parentPath?: string;
}

function TreeNodeComponent({ node, level, parentPath = "" }: TreeNodeComponentProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2); // Auto-expand first 2 levels

  const hasChildren = node.children && Object.keys(node.children).length > 0;

  const getIcon = () => {
    switch (node.type) {
      case "root":
        return <GitBranch className="w-4 h-4 text-purple-400" />;
      case "decision":
        return <GitBranch className="w-4 h-4 text-blue-400" />;
      case "leaf":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const getBgColor = () => {
    switch (node.type) {
      case "root":
        return "bg-purple-900/20 border-purple-700/50";
      case "decision":
        return "bg-blue-900/20 border-blue-700/50";
      case "leaf":
        return "bg-green-900/20 border-green-700/50";
      default:
        return "bg-slate-900/20 border-slate-700/50";
    }
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="mb-2">
      {/* Node Header */}
      <div
        className={`flex items-start gap-2 p-3 rounded-lg border ${getBgColor()} transition-all hover:bg-opacity-80`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0 mt-0.5 hover:bg-slate-700/50 rounded p-0.5 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Node Type & Attribute */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 uppercase font-semibold">{node.type}</span>
            {node.attribute && (
              <span className="text-sm text-cyan-400 font-semibold">
                {node.attribute}
              </span>
            )}
          </div>

          {/* Leaf Node Details */}
          {node.type === "leaf" && node.rule && (
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Rule:</span>
                <span className="text-slate-200 font-semibold">{node.rule.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Rank:</span>
                <span className="text-slate-300 font-mono">{node.rule.rank}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Profile:</span>
                <span className="text-blue-400">{node.rule.profile}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Policy Set:</span>
                <span className="text-slate-300">{node.rule.policy_set}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">State:</span>
                <span
                  className={`px-2 py-0.5 rounded font-semibold ${
                    node.rule.state === "enabled"
                      ? "bg-green-900/50 text-green-300"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {node.rule.state.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Children Count */}
          {hasChildren && (
            <div className="text-xs text-slate-500 mt-1">
              {Object.keys(node.children!).length} branch
              {Object.keys(node.children!).length !== 1 ? "es" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-1 border-l-2 border-slate-700 ml-2">
          {Object.entries(node.children!).map(([value, childNode]) => (
            <div key={value} className="relative">
              {/* Branch Label */}
              <div className="absolute -left-2 top-4 w-2 h-0.5 bg-slate-700" />
              <div className="ml-4 mb-1">
                <span className="inline-block px-2 py-1 bg-slate-900 text-slate-300 text-xs rounded border border-slate-700">
                  = {value}
                </span>
              </div>
              {/* Child Node */}
              <TreeNodeComponent
                node={childNode}
                level={level + 1}
                parentPath={parentPath ? `${parentPath} → ${value}` : value}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
