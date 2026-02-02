"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { ZoomIn, ZoomOut, Maximize2, Download, RotateCcw } from "lucide-react";

interface MermaidFlowchartProps {
  chart: string;
}

/**
 * Sanitizes text content by escaping special Mermaid characters
 */
function sanitizeText(text: string): string {
  return text
    .replace(/\(/g, '&#40;')   // (
    .replace(/\)/g, '&#41;')   // )
    .replace(/\|/g, '&#124;')  // |
    .replace(/\[/g, '&#91;')   // [
    .replace(/\]/g, '&#93;')   // ]
    .replace(/\{/g, '&#123;')  // {
    .replace(/\}/g, '&#125;'); // }
}

/**
 * Sanitizes Mermaid chart syntax by escaping special characters in node labels and edge labels
 * This fixes parsing errors caused by parentheses, pipes, and other special chars
 */
function sanitizeMermaidChart(chart: string): string {
  // Split into lines to process each line
  const lines = chart.split('\n');

  const sanitizedLines = lines.map(line => {
    // Skip comment lines
    if (line.trim().startsWith('%%')) {
      return line;
    }

    // Match edge connections with labels: N1 -->|label| N2
    const edgePattern = /^(\s*)(\w+)(\s*--[->]+\|)([^|]+)(\|\s*\w+)(\s*)$/;
    const edgeMatch = line.match(edgePattern);
    if (edgeMatch) {
      const [, indent, source, arrow, label, target, trailing] = edgeMatch;
      const hasSpecialChars = label.includes('(') || label.includes(')') ||
                              label.includes('|') || label.includes('[') ||
                              label.includes(']') || label.includes('{') ||
                              label.includes('}');
      if (hasSpecialChars) {
        const sanitizedLabel = sanitizeText(label);
        return `${indent}${source}${arrow}${sanitizedLabel}${target}${trailing}`;
      }
      return line;
    }

    // Match node definitions with various bracket types
    // Patterns: N1[label], N1{{label}}, N1(label), N1([label])
    const patterns = [
      /^(\s*)([A-Z]\w*)(\{{2})(.+?)(\}{2})(\s*)$/,  // {{decision}}
      /^(\s*)([A-Z]\w*)(\[{1,2})(.+?)(\]{1,2})(\s*)$/,  // [rectangle] or [[subroutine]]
      /^(\s*)([A-Z]\w*)(\(\[)(.+?)(\]\))(\s*)$/,  // ([stadium])
      /^(\s*)([A-Z]\w*)(\({1,2})(.+?)(\){1,2})(\s*)$/,  // (round) or ((circle))
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const [, indent, nodeId, openBracket, content, closeBracket, trailing] = match;

        // Check if content has problematic characters that need escaping
        const hasSpecialChars = content.includes('(') || content.includes(')') ||
                                content.includes('|') || content.includes('[') ||
                                content.includes(']') || content.includes('{') ||
                                content.includes('}');

        if (hasSpecialChars) {
          const sanitizedContent = sanitizeText(content);
          return `${indent}${nodeId}${openBracket}${sanitizedContent}${closeBracket}${trailing}`;
        }

        // If no special chars, return as is
        return line;
      }
    }

    return line;
  });

  return sanitizedLines.join('\n');
}

export default function MermaidFlowchart({ chart }: MermaidFlowchartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [refreshKey, setRefreshKey] = useState(0);

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

    const makeNodesDraggable = () => {
      if (!containerRef.current) return;

      const svg = containerRef.current.querySelector("svg");
      if (!svg) return;

      // Find all nodes (g elements with class containing 'node')
      const nodes = svg.querySelectorAll("g.node");

      nodes.forEach((node) => {
        const element = node as SVGGElement;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        let currentTransform = { x: 0, y: 0 };

        // Parse existing transform if any
        const transformAttr = element.getAttribute("transform");
        if (transformAttr) {
          const match = transformAttr.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            currentTransform.x = parseFloat(match[1]);
            currentTransform.y = parseFloat(match[2]);
          }
        }

        // Make cursor pointer on hover
        element.style.cursor = "move";

        const onMouseDown = (e: MouseEvent) => {
          isDragging = true;
          e.stopPropagation(); // Prevent panning

          // Get mouse position relative to SVG
          const svgRect = svg.getBoundingClientRect();
          const svgX = (e.clientX - svgRect.left) / zoom;
          const svgY = (e.clientY - svgRect.top) / zoom;

          dragOffset.x = svgX - currentTransform.x;
          dragOffset.y = svgY - currentTransform.y;

          element.style.cursor = "grabbing";
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isDragging) return;
          e.stopPropagation();

          const svgRect = svg.getBoundingClientRect();
          const svgX = (e.clientX - svgRect.left) / zoom;
          const svgY = (e.clientY - svgRect.top) / zoom;

          currentTransform.x = svgX - dragOffset.x;
          currentTransform.y = svgY - dragOffset.y;

          element.setAttribute(
            "transform",
            `translate(${currentTransform.x}, ${currentTransform.y})`
          );
        };

        const onMouseUp = () => {
          isDragging = false;
          element.style.cursor = "move";
        };

        element.addEventListener("mousedown", onMouseDown as EventListener);
        svg.addEventListener("mousemove", onMouseMove as EventListener);
        svg.addEventListener("mouseup", onMouseUp);
        svg.addEventListener("mouseleave", onMouseUp);
      });
    };

    const renderChart = async () => {
      if (containerRef.current) {
        try {
          const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
          const sanitizedChart = sanitizeMermaidChart(chart);
          const { svg } = await mermaid.render(id, sanitizedChart);
          containerRef.current.innerHTML = svg;

          // Make nodes draggable after rendering
          setTimeout(() => makeNodesDraggable(), 100);
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
  }, [chart, zoom, refreshKey]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 10));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleResetLayout = () => {
    setRefreshKey(prev => prev + 1);
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

  const handleDownloadImage = async () => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;

      // Get SVG dimensions
      const bbox = svgElement.getBBox();
      const width = bbox.width || 1200;
      const height = bbox.height || 800;

      // Set dimensions on cloned SVG for proper rendering
      clonedSvg.setAttribute("width", width.toString());
      clonedSvg.setAttribute("height", height.toString());
      clonedSvg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${width} ${height}`);

      // Add dark background to SVG
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", "100%");
      rect.setAttribute("height", "100%");
      rect.setAttribute("fill", "#1e293b");
      clonedSvg.insertBefore(rect, clonedSvg.firstChild);

      // Convert SVG to string
      const svgString = new XMLSerializer().serializeToString(clonedSvg);

      // Create a data URL instead of blob to avoid CORS issues
      const svgDataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

      // Create an image element
      const img = new Image();

      img.onload = () => {
        try {
          // Create canvas with higher resolution
          const scale = 2;
          const canvas = document.createElement("canvas");
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext("2d", { willReadFrequently: false });

          if (ctx) {
            // Scale context
            ctx.scale(scale, scale);

            // Draw the image
            ctx.drawImage(img, 0, 0, width, height);

            // Use toDataURL as fallback to avoid CORS issues
            try {
              const pngDataUrl = canvas.toDataURL("image/png");
              const link = document.createElement("a");
              link.download = `flowchart-${Date.now()}.png`;
              link.href = pngDataUrl;
              link.click();
            } catch (e) {
              // If canvas is still tainted, download SVG instead
              console.warn("Canvas tainted, downloading SVG instead:", e);
              downloadSvgDirectly(svgString);
            }
          }
        } catch (error) {
          console.error("Error creating PNG, downloading SVG instead:", error);
          downloadSvgDirectly(svgString);
        }
      };

      img.onerror = () => {
        console.error("Error loading image, downloading SVG instead");
        downloadSvgDirectly(svgString);
      };

      img.src = svgDataUrl;
    } catch (error) {
      console.error("Failed to download flowchart:", error);
      alert("Failed to download flowchart. Please try again.");
    }
  };

  const downloadSvgDirectly = (svgString: string) => {
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `flowchart-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportDrawio = async () => {
    if (!containerRef.current) return;

    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    try {
      // Parse SVG nodes and edges
      const nodes = svgElement.querySelectorAll("g.node");
      const edges = svgElement.querySelectorAll("g.edgePath");

      let cellId = 10;
      const cells: string[] = [];

      // Process nodes
      nodes.forEach((nodeGroup) => {
        const g = nodeGroup as SVGGElement;

        // Get transform position
        const transform = g.getAttribute("transform") || "";
        const translateMatch = transform.match(/translate\(([^,]+),([^)]+)\)/);
        let x = 100, y = 100;

        if (translateMatch) {
          x = parseFloat(translateMatch[1]) + 400; // Offset for visibility
          y = parseFloat(translateMatch[2]) + 100;
        }

        // Get text content
        const textElement = g.querySelector("text");
        const labelText = textElement?.textContent?.trim() || "Node";

        // Get shape type from class
        const className = g.getAttribute("class") || "";
        let shape = "rectangle";
        let fillColor = "#ffebee";
        let strokeColor = "#b71c1c";

        if (className.includes("disabledResult")) {
          fillColor = "#4a5568";
          strokeColor = "#718096";
        } else if (className.includes("result")) {
          fillColor = "#ffebee";
          strokeColor = "#b71c1c";
        } else {
          // Decision/attribute nodes
          shape = "rhombus";
          fillColor = "#fff3e0";
          strokeColor = "#e65100";
        }

        // Get approximate dimensions from bbox or use defaults
        const bbox = g.getBBox();
        const width = Math.max(bbox.width, 120);
        const height = Math.max(bbox.height, 60);

        cells.push(`        <mxCell id="${cellId}" value="${labelText.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=${fillColor};strokeColor=${strokeColor};fontColor=#000000;" vertex="1" parent="1">
          <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
        </mxCell>`);

        cellId++;
      });

      // Process edges (connections)
      edges.forEach((edgePath) => {
        const path = edgePath as SVGGElement;
        const pathElement = path.querySelector("path");

        if (pathElement) {
          const d = pathElement.getAttribute("d") || "";

          // Try to extract start and end points (simplified)
          const coords = d.match(/M([\d.]+),([\d.]+).*L([\d.]+),([\d.]+)/);

          if (coords) {
            const x1 = parseFloat(coords[1]) + 400;
            const y1 = parseFloat(coords[2]) + 100;
            const x2 = parseFloat(coords[3]) + 400;
            const y2 = parseFloat(coords[4]) + 100;

            // Get edge label if exists
            const labelElement = path.querySelector("text");
            const label = labelElement?.textContent?.trim() || "";

            cells.push(`        <mxCell id="${cellId}" value="${label.replace(/"/g, '&quot;')}" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#64748b;fontColor=#e2e8f0;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry">
            <mxPoint x="${x1}" y="${y1}" as="sourcePoint" />
            <mxPoint x="${x2}" y="${y2}" as="targetPoint" />
          </mxGeometry>
        </mxCell>`);

            cellId++;
          }
        }
      });

      // Create draw.io XML with individual cells
      const drawioXml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="ISE Flow Visualizer" version="21.0.0" etag="${Math.random().toString(36).substring(2)}" type="device">
  <diagram name="ISE Flowchart" id="flowchart">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${cells.join('\n')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

      // Download
      const blob = new Blob([drawioXml], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `flowchart-${Date.now()}.drawio`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export to draw.io:", error);
      alert("Failed to export to draw.io. Please try PNG or SVG export instead.");
    }
  };

  return (
    <div className="relative">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleDownloadImage}
          className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          title="Download as Image"
        >
          <Download className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-slate-200" />
        </button>
        <div className="px-3 py-2 bg-slate-800 rounded-lg text-slate-200 text-sm font-medium min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </div>
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
        <button
          onClick={handleResetLayout}
          className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          title="Reset Node Positions"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={handleExportDrawio}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          title="Export to Draw.io"
        >
          <Download className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Flowchart Container */}
      <div
        className="overflow-hidden bg-slate-900 rounded-lg border border-slate-700 p-8"
        style={{ minHeight: "800px", cursor: isPanning ? "grabbing" : "grab" }}
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
        Drag background to pan • Drag nodes to reposition • Zoom up to 1000% • Export as PNG/SVG/Draw.io
      </div>
    </div>
  );
}
