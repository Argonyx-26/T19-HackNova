import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import {
  GitGraph,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  ShieldAlert,
  User,
  Server,
  Camera,
  MapPin,
  AlertTriangle,
  Radio
} from 'lucide-react';
import type { SituationGraphData, GraphNode } from '../../types';

interface SituationGraphViewProps {
  graphData: SituationGraphData | null;
}

interface SimNode extends GraphNode, d3.SimulationNodeDatum {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  relationship: string;
}

export const SituationGraphView: React.FC<SituationGraphViewProps> = ({ graphData }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Dragging state
  const draggedNodeRef = useRef<SimNode | null>(null);

  const width = 800;
  const height = 480;

  // Initialize simulation nodes and links
  const [simNodes, setSimNodes] = useState<SimNode[]>([]);
  const [simLinks, setSimLinks] = useState<SimLink[]>([]);
  const simulationRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);

  // Setup D3 Force Simulation when graphData changes
  useEffect(() => {
    if (!graphData || graphData.nodes.length === 0) {
      setSimNodes([]);
      setSimLinks([]);
      return;
    }

    // Deep copy nodes to avoid mutating props
    const nodes: SimNode[] = graphData.nodes.map((n, i) => {
      // Intelligent initial placement in a circle around center to avoid knotting
      const angle = (i / graphData.nodes.length) * 2 * Math.PI;
      const initialDist = n.node_type === 'Situation' ? 0 : n.node_type === 'Event' ? 140 : 210;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * initialDist + (Math.random() - 0.5) * 20,
        y: height / 2 + Math.sin(angle) * initialDist + (Math.random() - 0.5) * 20,
      };
    });

    const links: SimLink[] = graphData.edges.map((e) => ({
      source: e.source,
      target: e.target,
      relationship: e.relationship || 'ASSOCIATED_WITH',
    }));

    // Create D3 Force Simulation with strong repulsion & collision prevention
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const rel = d.relationship;
            if (rel === 'TRIGGERED') return 95;
            if (rel === 'ACCESSED') return 110;
            return 125;
          })
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(-520).distanceMax(450))
      .force('collide', d3.forceCollide().radius(48).iterations(3))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('x', d3.forceX(width / 2).strength(0.04))
      .force('y', d3.forceY(height / 2).strength(0.04))
      .alphaDecay(0.028);

    simulation.on('tick', () => {
      // Keep nodes bounded inside the canvas
      nodes.forEach((n) => {
        n.x = Math.max(50, Math.min(width - 50, n.x));
        n.y = Math.max(45, Math.min(height - 45, n.y));
      });
      setSimNodes([...nodes]);
      setSimLinks([...links]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  // Find active / selected node details
  const activeNode = useMemo(() => {
    const targetId = selectedNodeId || hoveredNodeId;
    if (!targetId) return null;
    return simNodes.find((n) => n.id === targetId) || null;
  }, [selectedNodeId, hoveredNodeId, simNodes]);

  // Find connected neighbors and edges for highlight
  const { connectedNodeIds, connectedEdgeIndices } = useMemo(() => {
    const focusId = selectedNodeId || hoveredNodeId;
    if (!focusId) return { connectedNodeIds: new Set<string>(), connectedEdgeIndices: new Set<number>() };

    const nodeIds = new Set<string>([focusId]);
    const edgeIndices = new Set<number>();

    simLinks.forEach((link, idx) => {
      const srcId = typeof link.source === 'object' ? link.source.id : link.source;
      const tgtId = typeof link.target === 'object' ? link.target.id : link.target;

      if (srcId === focusId || tgtId === focusId) {
        nodeIds.add(srcId);
        nodeIds.add(tgtId);
        edgeIndices.add(idx);
      }
    });

    return { connectedNodeIds: nodeIds, connectedEdgeIndices: edgeIndices };
  }, [selectedNodeId, hoveredNodeId, simLinks]);

  // Node Color Theme
  const getNodeVisuals = (node: GraphNode) => {
    switch (node.node_type) {
      case 'Situation':
        return {
          stroke: '#ef4444',
          fill: '#2a090e',
          glow: '#ef4444',
          icon: ShieldAlert,
          radius: 18,
          label: 'SITUATION'
        };
      case 'Person':
        return {
          stroke: '#f59e0b',
          fill: '#241604',
          glow: '#f59e0b',
          icon: User,
          radius: 14,
          label: 'PERSON'
        };
      case 'Device':
      case 'Endpoint':
        return {
          stroke: '#38bdf8',
          fill: '#051829',
          glow: '#38bdf8',
          icon: Server,
          radius: 14,
          label: 'ENDPOINT'
        };
      case 'Camera':
      case 'Sensor':
        return {
          stroke: '#a855f7',
          fill: '#1e0a2e',
          glow: '#a855f7',
          icon: Camera,
          radius: 13,
          label: 'SENSOR'
        };
      case 'Location':
        return {
          stroke: '#10b981',
          fill: '#041f17',
          glow: '#10b981',
          icon: MapPin,
          radius: 15,
          label: 'LOCATION'
        };
      case 'Event':
      default:
        const isCritical = node.severity && node.severity >= 0.7;
        return {
          stroke: isCritical ? '#f43f5e' : '#818cf8',
          fill: isCritical ? '#260810' : '#0e1026',
          glow: isCritical ? '#f43f5e' : '#818cf8',
          icon: AlertTriangle,
          radius: 13,
          label: 'EVENT'
        };
    }
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: SimNode) => {
    e.stopPropagation();
    draggedNodeRef.current = node;
    node.fx = node.x;
    node.fy = node.y;
    if (simulationRef.current) {
      simulationRef.current.alphaTarget(0.3).restart();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeRef.current) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const clientX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
      const clientY = (e.clientY - rect.top - panOffset.y) / zoomLevel;
      draggedNodeRef.current.fx = clientX;
      draggedNodeRef.current.fy = clientY;
    } else if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current.fx = null;
      draggedNodeRef.current.fy = null;
      draggedNodeRef.current = null;
      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0);
      }
    }
    setIsPanning(false);
  };

  // Background Pan Handlers
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

  // Zoom Controls
  const handleZoom = (factor: number) => {
    setZoomLevel((prev) => Math.max(0.5, Math.min(2.5, prev * factor)));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedNodeId(null);
    if (simulationRef.current) {
      simulationRef.current.alpha(0.3).restart();
    }
  };

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="bg-[#080d1a] border border-neutral-800 rounded-2xl p-8 text-center text-xs font-mono text-neutral-500 shadow-xl">
        <Radio className="w-5 h-5 text-neutral-600 mx-auto mb-2 animate-pulse" />
        No active situation topology graph available.
      </div>
    );
  }

  // Filtered nodes
  const visibleNodes = simNodes.filter((n) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EVENTS') return n.node_type === 'Event' || n.node_type === 'Situation';
    if (filterType === 'ENTITIES') return n.node_type === 'Person' || n.node_type === 'Device' || n.node_type === 'Camera';
    if (filterType === 'LOCATIONS') return n.node_type === 'Location';
    return true;
  });

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));

  return (
    <div
      ref={containerRef}
      className={`bg-[#060a16] border border-neutral-800/90 rounded-2xl p-5 space-y-4 shadow-2xl relative select-none font-sans overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col justify-between' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. Header & Live Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center">
            <GitGraph className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-neutral-200">
              NetworkX Threat Topology Graph
            </h2>
            <div className="text-[10px] text-neutral-500 font-mono">
              Dynamic situational entity & event correlation lattice
            </div>
          </div>
        </div>

        {/* Live Metrics HUD */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <div className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400">
            Nodes: <strong className="text-cyan-400">{graphData.metrics.node_count}</strong>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400">
            Edges: <strong className="text-amber-400">{graphData.metrics.edge_count}</strong>
          </div>
          <div className="hidden sm:block px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-400">
            Density: <strong className="text-emerald-400">{graphData.metrics.density}</strong>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center space-x-1 pl-2 border-l border-neutral-800">
            <button
              onClick={() => handleZoom(1.15)}
              title="Zoom In"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.85)}
              title="Zoom Out"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills Bar */}
      <div className="flex items-center justify-between text-xs font-mono z-10">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider mr-1">Filter:</span>
          {['ALL', 'EVENTS', 'ENTITIES', 'LOCATIONS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-2.5 py-0.5 rounded text-[10px] transition-all font-mono ${
                filterType === f
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-neutral-500 hidden sm:block">
          Click or drag nodes to inspect relationships • Scroll to zoom
        </div>
      </div>

      {/* 3. Interactive SVG Topology Viewport */}
      <div
        className="relative w-full h-[400px] border border-neutral-800/80 rounded-xl bg-[#03060f] overflow-hidden cursor-crosshair shadow-inner"
        onMouseDown={handleBackgroundMouseDown}
      >
        {/* Subtle Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full object-contain overflow-visible"
        >
          <defs>
            {/* Arrowhead Markers */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#334155" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#ef4444" />
            </marker>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#06b6d4" />
            </marker>

            {/* Glowing Radial Gradients */}
            <radialGradient id="situationHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Transformed Canvas Container for Pan & Zoom */}
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            {/* RENDER EDGES (Curved Paths with dynamic highlighting) */}
            {simLinks.map((link, idx) => {
              const src = typeof link.source === 'object' ? link.source : simNodes.find((n) => n.id === link.source);
              const tgt = typeof link.target === 'object' ? link.target : simNodes.find((n) => n.id === link.target);

              if (!src || !tgt) return null;
              if (!visibleNodeIds.has(src.id) || !visibleNodeIds.has(tgt.id)) return null;

              const isConnected = connectedEdgeIndices.has(idx);
              const isAnyFocus = selectedNodeId || hoveredNodeId;
              const edgeAlpha = isConnected ? 1 : isAnyFocus ? 0.12 : 0.45;
              const strokeColor = isConnected
                ? src.node_type === 'Situation' || tgt.node_type === 'Situation'
                  ? '#ef4444'
                  : '#06b6d4'
                : '#334155';

              // Quadratic curve calculation for clean non-overlapping arcs
              const dx = tgt.x - src.x;
              const dy = tgt.y - src.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const curvature = Math.min(25, dist * 0.15) * (idx % 2 === 0 ? 1 : -1);
              const midX = (src.x + tgt.x) / 2 - (dy / dist) * curvature;
              const midY = (src.y + tgt.y) / 2 + (dx / dist) * curvature;

              const pathData = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;

              return (
                <g key={`edge-${idx}`} className="transition-all duration-200">
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isConnected ? 2.4 : 1.2}
                    strokeOpacity={edgeAlpha}
                    strokeDasharray={link.relationship === 'TRIGGERED' ? '4 3' : 'none'}
                    markerEnd={
                      isConnected
                        ? strokeColor === '#ef4444'
                          ? 'url(#arrow-active)'
                          : 'url(#arrow-cyan)'
                        : 'url(#arrow-default)'
                    }
                  />

                  {/* Relationship Tag on Hover / Focus */}
                  {isConnected && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-8"
                        width="76"
                        height="16"
                        rx="3"
                        fill="#050914ee"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#cbd5e1"
                        fontSize="8"
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none select-none font-bold"
                      >
                        {link.relationship}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* RENDER NODES */}
            {visibleNodes.map((node) => {
              const visual = getNodeVisuals(node);
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isConnected = connectedNodeIds.has(node.id);
              const isAnyFocus = selectedNodeId || hoveredNodeId;

              const nodeOpacity = isConnected || isSelected || isHovered ? 1 : isAnyFocus ? 0.22 : 1;
              const radius = visual.radius * (isSelected || isHovered ? 1.25 : 1);
              const Icon = visual.icon;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  opacity={nodeOpacity}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNodeId(isSelected ? null : node.id);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer transition-transform duration-150 group"
                >
                  {/* Outer Pulsing Halo for Active Situation */}
                  {node.node_type === 'Situation' && (
                    <circle
                      r={radius * 2.2}
                      fill="url(#situationHalo)"
                      className="animate-ping"
                      style={{ animationDuration: '3s' }}
                    />
                  )}

                  {/* Selection Ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke={visual.stroke}
                      strokeWidth={1.8}
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={radius}
                    fill={visual.fill}
                    stroke={visual.stroke}
                    strokeWidth={isSelected || isHovered ? 2.6 : 1.8}
                    className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.3)] transition-all"
                  />

                  {/* Embedded Icon / Glyph */}
                  <foreignObject
                    x={-radius * 0.65}
                    y={-radius * 0.65}
                    width={radius * 1.3}
                    height={radius * 1.3}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon
                        className="w-full h-full"
                        style={{ color: visual.stroke }}
                      />
                    </div>
                  </foreignObject>

                  {/* Clean Monospace Label with Backdrop Pill */}
                  <g transform={`translate(0, ${radius + 12})`}>
                    <rect
                      x={-Math.min(75, Math.max(35, node.label.length * 3.4))}
                      y="-7"
                      width={Math.min(150, Math.max(70, node.label.length * 6.8))}
                      height="14"
                      rx="3"
                      fill="#060b17ee"
                      stroke={isSelected || isHovered ? visual.stroke : '#1e293b'}
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="3"
                      fill={isSelected || isHovered ? '#ffffff' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                      className="pointer-events-none select-none font-semibold"
                    >
                      {node.label.length > 20 ? `${node.label.slice(0, 18)}...` : node.label}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* 4. Interactive Tactical Node Inspector Flyout */}
        {activeNode && (
          <div className="absolute top-3 right-3 w-80 bg-[#090e1eee]/95 backdrop-blur-md border border-neutral-700/80 rounded-xl p-4 text-xs font-mono shadow-2xl z-30 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 mb-2.5">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getNodeVisuals(activeNode).stroke }}
                ></span>
                <span className="font-bold text-white text-[11px] truncate max-w-[190px]">
                  {activeNode.label}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setHoveredNodeId(null);
                }}
                className="text-neutral-500 hover:text-neutral-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">TYPE:</span>
                <span className="text-cyan-400 font-semibold">{activeNode.node_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">ID:</span>
                <span className="text-neutral-300 font-mono text-[10px]">{activeNode.id}</span>
              </div>

              {activeNode.severity !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">SEVERITY:</span>
                  <span
                    className={`font-bold ${
                      activeNode.severity >= 0.7 ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {activeNode.severity} / 1.0
                  </span>
                </div>
              )}

              {activeNode.status && (
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">STATUS:</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 font-bold text-[10px]">
                    {activeNode.status}
                  </span>
                </div>
              )}

              {/* Connected Peers Summary */}
              <div className="pt-2 border-t border-neutral-800/80 mt-2">
                <div className="text-[10px] text-neutral-400 font-bold mb-1 flex items-center justify-between">
                  <span>CONNECTED TOPOLOGY:</span>
                  <span className="text-cyan-400">
                    {connectedNodeIds.size > 0 ? connectedNodeIds.size - 1 : 0} links
                  </span>
                </div>

                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {simLinks
                    .filter((l) => {
                      const s = typeof l.source === 'object' ? l.source.id : l.source;
                      const t = typeof l.target === 'object' ? l.target.id : l.target;
                      return s === activeNode.id || t === activeNode.id;
                    })
                    .map((l, i) => {
                      const isSrc = (typeof l.source === 'object' ? l.source.id : l.source) === activeNode.id;
                      const peerId = isSrc
                        ? typeof l.target === 'object'
                          ? l.target.id
                          : l.target
                        : typeof l.source === 'object'
                        ? l.source.id
                        : l.source;
                      const peerNode = simNodes.find((n) => n.id === peerId);

                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedNodeId(peerId)}
                          className="flex items-center justify-between p-1 rounded bg-neutral-900/60 hover:bg-neutral-800 cursor-pointer text-[10px] text-neutral-300 transition-colors"
                        >
                          <span className="truncate max-w-[140px]">
                            {isSrc ? '→' : '←'} {peerNode?.label || peerId}
                          </span>
                          <span className="text-[9px] text-neutral-500">{l.relationship}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Clean Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-neutral-400 pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-500/20"></span>
          <span>Situation Root</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20"></span>
          <span>Person / Identity</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-sky-400/20"></span>
          <span>Endpoint / Device</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-purple-400/20"></span>
          <span>Camera / Sensor</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20"></span>
          <span>Location Zone</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/20"></span>
          <span>Critical Event</span>
        </div>
      </div>
    </div>
  );
};
