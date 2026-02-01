"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface MermaidFlowchartProps {
  chart: string;
}

export default function MermaidFlowchart({ chart }: MermaidFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "dark",
      themeVariables: {
        primaryColor: "#3b82f6",
        primaryTextColor: "#fff",
        primaryBorderColor: "#1e40af",
        lineColor: "#64748b",
        secondaryColor: "#8b5cf6",
        tertiaryColor: "#06b6d4",
        background: "#1e293b",
        mainBkg: "#334155",
        secondBkg: "#475569",
        textColor: "#e2e8f0",
        fontSize: "14px",
      },
    });

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          containerRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Failed to render mermaid chart:", error);
          if (containerRef.current) {
            containerRef.current.innerHTML = `
              <div class="text-red-400 p-4">
                Failed to render flowchart. Please check the mermaid syntax.
              </div>
            `;
          }
        }
      }
    };

    renderChart();
  }, [chart]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setStartPosition({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-slate-200" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-slate-200" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4 text-slate-200" />
        </button>
      </div>

      {/* Flowchart Container */}
      <div
        className="overflow-hidden bg-slate-900 rounded-lg border border-slate-700 p-8"
        style={{ minHeight: "600px", cursor: isPanning ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          ref={containerRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "center",
            transition: isPanning ? "none" : "transform 0.2s ease",
          }}
          className="flex justify-center items-center"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 text-center">
        Click and drag to pan • Use zoom controls or scroll wheel
      </div>
    </div>
  );
}
