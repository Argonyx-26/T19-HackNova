import React, { useState } from 'react';
import { GitGraph } from 'lucide-react';
import type { SituationGraphData, GraphNode } from '../../types';

interface SituationGraphViewProps {
  graphData: SituationGraphData | null;
}

export const SituationGraphView: React.FC<SituationGraphViewProps> = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-8 text-center text-xs font-mono text-slate-500">
        No graph topology available for active situation.
      </div>
    );
  }

  // Simple layout coordinates generator for clear visual arrangement in SVG
  const width = 640;
  const height = 360;
  const centerX = width / 2;

  const nodes = graphData.nodes;
  const nodePositions: Record<string, { x: number; y: number }> = {};

  // Position root situation at center, entities on left, events in middle, locations on right
  nodes.forEach((n, idx) => {
    if (n.node_type === 'Situation') {
      nodePositions[n.id] = { x: centerX, y: 50 };
    } else if (n.node_type === 'Person' || n.node_type === 'Device' || n.node_type === 'Camera') {
      nodePositions[n.id] = {
        x: 100 + (idx % 3) * 60,
        y: 120 + Math.floor(idx / 3) * 70,
      };
    } else if (n.node_type === 'Event') {
      nodePositions[n.id] = {
        x: centerX - 60 + (idx % 3) * 80,
        y: 160 + Math.floor(idx / 3) * 60,
      };
    } else if (n.node_type === 'Location') {
      nodePositions[n.id] = {
        x: width - 130,
        y: 130 + idx * 70,
      };
    } else {
      nodePositions[n.id] = {
        x: 150 + (idx * 90) % (width - 200),
        y: 150 + (idx * 50) % (height - 180),
      };
    }
  });

  const getNodeColor = (node: GraphNode) => {
    switch (node.node_type) {
      case 'Situation':
        return '#06b6d4'; // Cyan
      case 'Person':
        return '#f59e0b'; // Amber
      case 'Device':
        return '#3b82f6'; // Blue
      case 'Camera':
        return '#a855f7'; // Purple
      case 'Location':
        return '#10b981'; // Emerald
      case 'Event':
        return node.severity && node.severity > 0.7 ? '#ef4444' : '#8b5cf6';
      default:
        return '#94a3b8';
    }
  };

  return (
    <div className="bg-sentinel-surface border border-sentinel-border rounded-xl p-5 space-y-4">
      {/* Header & Graph Metrics */}
      <div className="flex items-center justify-between border-b border-sentinel-border pb-3">
        <div className="flex items-center space-x-2">
          <GitGraph className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-200">
            NetworkX Threat Topology Graph
          </h2>
        </div>

        {/* Metrics Bar */}
        <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-400">
          <span>Nodes: <strong className="text-white">{graphData.metrics.node_count}</strong></span>
          <span>•</span>
          <span>Edges: <strong className="text-white">{graphData.metrics.edge_count}</strong></span>
          <span>•</span>
          <span>Density: <strong className="text-white">{graphData.metrics.density}</strong></span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-sentinel-border/60 rounded-lg bg-sentinel-bg/80 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#33486f" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graphData.edges.map((edge, idx) => {
            const p1 = nodePositions[edge.source];
            const p2 = nodePositions[edge.target];
            if (!p1 || !p2) return null;
            return (
              <g key={idx}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#243452"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: 50, y: 50 };
            const isSelected = selectedNode?.id === node.id;
            const color = getNodeColor(node);

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer transition group"
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={node.node_type === 'Situation' ? 14 : 10}
                  fill="#0f172a"
                  stroke={color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="transition group-hover:scale-125"
                />
                <text
                  x={pos.x}
                  y={pos.y + 18}
                  fill="#94a3b8"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Inspector Flyout */}
        {selectedNode && (
          <div className="absolute bottom-2 right-2 p-3 rounded-lg bg-sentinel-card/95 border border-sentinel-border text-xs font-mono space-y-1 shadow-lg max-w-xs backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-sentinel-border pb-1">
              <span className="font-bold text-white">{selectedNode.label}</span>
              <span className="text-[10px] text-cyan-400">[{selectedNode.node_type}]</span>
            </div>
            <div className="text-[10px] text-slate-400">ID: {selectedNode.id}</div>
            {selectedNode.severity !== undefined && (
              <div className="text-[10px] text-slate-400">Severity: {selectedNode.severity}</div>
            )}
            {selectedNode.status && (
              <div className="text-[10px] text-slate-400">Status: {selectedNode.status}</div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-slate-400 pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span>Situation</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Person</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span>
          <span>Endpoint</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
          <span>Camera</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Location</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>Critical Event</span>
        </div>
      </div>
    </div>
  );
};
