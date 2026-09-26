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
            if (rel === 'OCCURRED_AT') return 120;
            if (rel === 'INVOLVED') return 110;
            return 130;
          })
          .strength(0.6)
      )
      .force('charge', d3.forceManyBody().strength(-380))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.08))
      .force('collision', d3.forceCollide().radius(40).iterations(3));

    simulation.on('tick', () => {
      setSimNodes([...nodes]);
      setSimLinks([...links]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [graphData]);

  const activeNode = useMemo(() => {
    const targetId = selectedNodeId || hoveredNodeId;
    if (!targetId) return null;
    return simNodes.find((n) => n.id === targetId) || null;
  }, [selectedNodeId, hoveredNodeId, simNodes]);

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

  // Warm Sentinel-X Obsidian & Gold Node Visuals
  const getNodeVisuals = (node: GraphNode) => {
    switch (node.node_type) {
      case 'Situation':
        return {
          stroke: '#f0d28f',
          fill: '#2a1608',
          glow: 'rgba(240, 210, 143, 0.6)',
          icon: ShieldAlert,
          radius: 19,
          label: 'SITUATION'
        };
      case 'Person':
        return {
          stroke: '#e8b25c',
          fill: '#24180c',
          glow: 'rgba(232, 178, 92, 0.5)',
          icon: User,
          radius: 15,
          label: 'PERSON'
        };
      case 'Device':
      case 'Endpoint':
        return {
          stroke: '#c9a15d',
          fill: '#1c140a',
          glow: 'rgba(201, 161, 93, 0.45)',
          icon: Server,
          radius: 14,
          label: 'ENDPOINT'
        };
      case 'Camera':
      case 'Sensor':
        return {
          stroke: '#f0d28f',
          fill: '#20160b',
          glow: 'rgba(240, 210, 143, 0.45)',
          icon: Camera,
          radius: 14,
          label: 'SENSOR'
        };
      case 'Location':
        return {
          stroke: '#3fae63',
          fill: '#091c10',
          glow: 'rgba(63, 174, 99, 0.4)',
          icon: MapPin,
          radius: 15,
          label: 'LOCATION'
        };
      case 'Event':
      default:
        const isCritical = node.severity && node.severity >= 0.7;
        return {
          stroke: isCritical ? '#e5502f' : '#c9a15d',
          fill: isCritical ? '#290b07' : '#1c140a',
          glow: isCritical ? 'rgba(229, 80, 47, 0.5)' : 'rgba(201, 161, 93, 0.35)',
          icon: AlertTriangle,
          radius: 13,
          label: 'EVENT'
        };
    }
  };

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

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setPanStart({
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      });
    }
  };

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
      <div className="bg-[#0b0805]/90 border border-[#c9a15d]/20 rounded-2xl p-8 text-center text-xs font-mono text-[#a3927a] shadow-xl">
        <Radio className="w-5 h-5 text-[#f0d28f] mx-auto mb-2 animate-pulse" />
        No active situation topology graph available.
      </div>
    );
  }

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
      className={`bg-[#0b0805]/95 border border-[#c9a15d]/30 rounded-3xl p-5 md:p-6 space-y-4 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative select-none font-sans overflow-hidden backdrop-blur-2xl ${
        isFullscreen ? 'fixed inset-4 z-50 flex flex-col justify-between' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 1. Header & Live Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c9a15d]/20 pb-3.5 z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#24170c] border border-[#c9a15d]/40 flex items-center justify-center text-[#f0d28f]">
            <GitGraph className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono uppercase font-bold tracking-wider text-[#fff6e4]">
              NetworkX Threat Topology Graph
            </h2>
            <div className="text-[10px] text-[#a3927a] font-mono">
              Dynamic situational entity & event correlation lattice
            </div>
          </div>
        </div>

        {/* Live Metrics HUD */}
        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <div className="px-3 py-1 rounded-xl bg-[#140e08] border border-[#c9a15d]/25 text-[#d5c7b3]">
            Nodes: <strong className="text-[#f0d28f]">{graphData.metrics.node_count}</strong>
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#140e08] border border-[#c9a15d]/25 text-[#d5c7b3]">
            Edges: <strong className="text-[#e8b25c]">{graphData.metrics.edge_count}</strong>
          </div>
          <div className="hidden sm:block px-3 py-1 rounded-xl bg-[#140e08] border border-[#c9a15d]/25 text-[#d5c7b3]">
            Density: <strong className="text-emerald-400">{graphData.metrics.density}</strong>
          </div>

          {/* Canvas Controls */}
          <div className="flex items-center space-x-1 pl-2 border-l border-[#c9a15d]/20">
            <button
              onClick={() => handleZoom(1.15)}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-[#1f150b] text-[#a3927a] hover:text-[#fff6e4] transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom(0.85)}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-[#1f150b] text-[#a3927a] hover:text-[#fff6e4] transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              title="Reset View"
              className="p-1.5 rounded-lg hover:bg-[#1f150b] text-[#a3927a] hover:text-[#fff6e4] transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Toggle Fullscreen"
              className="p-1.5 rounded-lg hover:bg-[#1f150b] text-[#a3927a] hover:text-[#fff6e4] transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills Bar */}
      <div className="flex items-center justify-between text-xs font-mono z-10 flex-wrap gap-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-[#a3927a] uppercase tracking-wider mr-1">Filter:</span>
          {['ALL', 'EVENTS', 'ENTITIES', 'LOCATIONS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-3 py-1 rounded-xl text-[10px] transition-all font-mono font-bold cursor-pointer ${
                filterType === f
                  ? 'bg-gradient-to-b from-[#3a2814] to-[#1a1107] text-[#fff6e4] border border-[#f0d28f]/60 shadow-[0_0_12px_rgba(240,210,143,0.25)]'
                  : 'bg-[#140e08]/70 text-[#a3927a] border border-[#c9a15d]/20 hover:text-[#fff6e4]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-[#a3927a] hidden sm:block">
          Click or drag nodes to inspect relationships • Scroll to zoom
        </div>
      </div>

      {/* 3. Interactive SVG Topology Viewport */}
      <div
        className="relative w-full h-[400px] border border-[#c9a15d]/25 rounded-2xl bg-[#070503] overflow-hidden cursor-crosshair shadow-inner"
        onMouseDown={handleBackgroundMouseDown}
      >
        {/* Warm Gold Dot Matrix Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #f0d28f 1px, transparent 0)`,
            backgroundSize: '28px 28px'
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
              id="arrow-gold"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#c9a15d" />
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
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#f0d28f" />
            </marker>

            {/* Glowing Radial Gradients */}
            <radialGradient id="situationHalo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0d28f" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#f0d28f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Transformed Canvas Container for Pan & Zoom */}
          <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
            {/* RENDER EDGES */}
            {simLinks.map((link, idx) => {
              const src = typeof link.source === 'object' ? link.source : simNodes.find((n) => n.id === link.source);
              const tgt = typeof link.target === 'object' ? link.target : simNodes.find((n) => n.id === link.target);

              if (!src || !tgt) return null;
              if (!visibleNodeIds.has(src.id) || !visibleNodeIds.has(tgt.id)) return null;

              const isConnected = connectedEdgeIndices.has(idx);
              const isAnyFocus = selectedNodeId || hoveredNodeId;
              const edgeAlpha = isConnected ? 1 : isAnyFocus ? 0.15 : 0.45;
              const strokeColor = isConnected ? '#f0d28f' : '#7a5a2e';

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
                    markerEnd={isConnected ? 'url(#arrow-active)' : 'url(#arrow-gold)'}
                  />

                  {/* Relationship Tag on Hover / Focus */}
                  {isConnected && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-38"
                        y="-8"
                        width="76"
                        height="16"
                        rx="4"
                        fill="#120c06ee"
                        stroke="#f0d28f"
                        strokeWidth="0.8"
                      />
                      <text
                        x="0"
                        y="3"
                        fill="#f0d28f"
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
                    className="filter drop-shadow-[0_0_10px_rgba(201,161,93,0.35)] transition-all"
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
                      rx="4"
                      fill="#120c06ee"
                      stroke={isSelected || isHovered ? visual.stroke : '#3a2814'}
                      strokeWidth="0.8"
                    />
                    <text
                      x="0"
                      y="3"
                      fill={isSelected || isHovered ? '#ffffff' : '#d5c7b3'}
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
          <div className="absolute top-3 right-3 w-80 bg-[#0d0905]/98 backdrop-blur-2xl border border-[#c9a15d]/40 rounded-2xl p-4 text-xs font-mono shadow-2xl z-30 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-[#c9a15d]/20 mb-2.5">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getNodeVisuals(activeNode).stroke }}
                ></span>
                <span className="font-bold text-[#fff6e4] text-[11px] truncate max-w-[190px]">
                  {activeNode.label}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedNodeId(null);
                  setHoveredNodeId(null);
                }}
                className="text-[#a3927a] hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#a3927a]">TYPE:</span>
                <span className="text-[#f0d28f] font-semibold">{activeNode.node_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a3927a]">ID:</span>
                <span className="text-[#d5c7b3] font-mono text-[10px]">{activeNode.id}</span>
              </div>

              {activeNode.severity !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-[#a3927a]">SEVERITY:</span>
                  <span
                    className={`font-bold ${
                      activeNode.severity >= 0.7 ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {activeNode.severity} / 1.0
                  </span>
                </div>
              )}

              {/* Connected Peers Summary */}
              <div className="pt-2 border-t border-[#c9a15d]/20 mt-2">
                <div className="text-[10px] text-[#a3927a] font-bold mb-1 flex items-center justify-between">
                  <span>CONNECTED TOPOLOGY:</span>
                  <span className="text-[#f0d28f]">
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
                          className="flex items-center justify-between p-1 rounded-lg bg-[#1a1209] hover:bg-[#271b0e] cursor-pointer text-[10px] text-[#d5c7b3] transition-colors"
                        >
                          <span className="truncate max-w-[140px]">
                            {isSrc ? '→' : '←'} {peerNode?.label || peerId}
                          </span>
                          <span className="text-[9px] text-[#a3927a]">{l.relationship}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Clean Warm Gold Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] font-mono text-[#a3927a] pt-1">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f0d28f] ring-2 ring-[#f0d28f]/30"></span>
          <span>Situation Root</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e8b25c] ring-2 ring-[#e8b25c]/30"></span>
          <span>Person / Identity</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c9a15d] ring-2 ring-[#c9a15d]/30"></span>
          <span>Endpoint / Device</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3fae63] ring-2 ring-[#3fae63]/30"></span>
          <span>Location Zone</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e5502f] ring-2 ring-[#e5502f]/30"></span>
          <span>Critical Event</span>
        </div>
      </div>
    </div>
  );
};
