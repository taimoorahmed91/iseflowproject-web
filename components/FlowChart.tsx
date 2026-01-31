"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, ZoomIn, ZoomOut } from "lucide-react";
import DetailSidebar from "./DetailSidebar";
import { ProcessedData } from "@/lib/types";

interface FlowChartProps {
  nodes: Node[];
  edges: Edge[];
  policySetName: string;
  flowType: "auth" | "authz";
  onBack: () => void;
  referenceData?: ProcessedData["reference_data"];
}

export default function FlowChart({
  nodes: initialNodes,
  edges: initialEdges,
  policySetName,
  flowType,
  onBack,
  referenceData,
}: FlowChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
    setIsSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
    setSelectedNode(null);
  }, []);

  const flowTitle = flowType === "auth" ? "Authentication Flow" : "Authorization Flow";

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Policy Sets</span>
          </button>
          <div className="h-6 w-px bg-slate-700" />
          <div>
            <h1 className="text-xl font-semibold text-slate-100">{policySetName}</h1>
            <p className="text-sm text-slate-400">{flowTitle}</p>
          </div>
        </div>

        <div className="text-sm text-slate-400">
          Click any node to view details
        </div>
      </div>

      {/* Flowchart */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 50, y: 50, zoom: 0.8 }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#334155" />
          <Controls
            showZoom={true}
            showFitView={true}
            showInteractive={false}
            className="bg-slate-800 border-slate-700"
          />
          <MiniMap
            nodeColor={(node) => {
              const style = node.style as any;
              return style?.background || "#1e40af";
            }}
            maskColor="rgba(15, 23, 42, 0.8)"
            className="bg-slate-800 border-slate-700"
          />
        </ReactFlow>
      </div>

      {/* Detail Sidebar */}
      <DetailSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        nodeData={selectedNode}
        referenceData={referenceData}
      />
    </div>
  );
}
