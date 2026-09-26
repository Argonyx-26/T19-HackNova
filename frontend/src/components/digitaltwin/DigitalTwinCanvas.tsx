import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Layers, Radio, Crosshair, RotateCcw } from 'lucide-react';
import type { SiteCampus, Zone, SpatialAsset } from '../../types';

interface DigitalTwinCanvasProps {
  campusData?: SiteCampus | null;
  activeSituationId?: string;
  threatLevel?: number; // 0.0 to 1.0
  onSelectZone?: (zone: Zone) => void;
  onSelectAsset?: (asset: SpatialAsset) => void;
}

type ViewLevel = 'GLOBAL' | 'BUILDING' | 'FLOOR_4' | 'FLOOR_5';

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  campusData: _campusData,
  activeSituationId = 'sit-20260925-001',
  threatLevel: _threatLevel = 0.85,
  onSelectZone: _onSelectZone,
  onSelectAsset: _onSelectAsset,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [currentLevel, setCurrentLevel] = useState<ViewLevel>('BUILDING');
  const [wireframeMode, setWireframeMode] = useState(false);
  const [selectedEntityInfo] = useState<{
    type: 'ZONE' | 'ASSET' | 'FLOOR';
    name: string;
    details: string;
    criticality?: string;
    status?: string;
  } | null>({
    type: 'ZONE',
    name: 'Zone 402 - Server Corridor & Hardware Vault',
    details: 'Compromised Zone: Unauthorized physical access + CCTV anomaly detected. Threat actively escalating.',
    criticality: 'CRITICAL',
    status: 'ACTIVE_BREACH'
  });

  // Scene references to preserve across re-renders
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);

  // Camera targets for smooth interpolation
  const targetCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 0));
  const currentCamLook = useRef<THREE.Vector3>(new THREE.Vector3(0, 15, 0));

  // Mouse interaction state
  const isDragging = useRef(false);
  const prevMousePos = useRef({ x: 0, y: 0 });
  const spherical = useRef({ radius: 85, theta: 0.8, phi: 1.1 });

  // Camera preset coordinator
  const setCameraView = useCallback((level: ViewLevel) => {
    setCurrentLevel(level);
    if (level === 'GLOBAL') {
      spherical.current = { radius: 140, theta: 0.7, phi: 1.25 };
      targetCamLook.current.set(0, 5, 0);
    } else if (level === 'BUILDING') {
      spherical.current = { radius: 85, theta: 0.85, phi: 1.1 };
      targetCamLook.current.set(0, 15, 0);
    } else if (level === 'FLOOR_4') {
      spherical.current = { radius: 42, theta: 0.5, phi: 0.95 };
      targetCamLook.current.set(2, 22, -2);
    } else if (level === 'FLOOR_5') {
      spherical.current = { radius: 38, theta: 1.2, phi: 0.9 };
      targetCamLook.current.set(-2, 28, 2);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const width = mountRef.current.clientWidth || 800;
    const height = 480;

    // 1. Scene setup with warm obsidian atmosphere
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0a0704);
    scene.fog = new THREE.FogExp2(0x0a0704, 0.007);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    cameraRef.current = camera;
    camera.position.set(55, 45, 65);
    camera.lookAt(0, 15, 0);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Warm Luxury Gold & Obsidian Lighting
    const ambientLight = new THREE.AmbientLight(0x4a341e, 2.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf0d28f, 2.6);
    keyLight.position.set(40, 70, 30);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7a4f1c, 1.8);
    rimLight.position.set(-40, -20, -30);
    scene.add(rimLight);

    const threatLight = new THREE.PointLight(0xe5502f, 3.8, 60);
    threatLight.position.set(5, 22, -3);
    scene.add(threatLight);

    const vaultLight = new THREE.PointLight(0xf0d28f, 2.4, 50);
    vaultLight.position.set(-6, 29, 4);
    scene.add(vaultLight);

    // 5. Root Object Group
    const rootGroup = new THREE.Group();
    objectsGroupRef.current = rootGroup;
    scene.add(rootGroup);

    // -------------------------------------------------------------
    // LEVEL 1: Site Ground & Warm Gold Coordinate Grid
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(180, 45, 0xc9a15d, 0x22170d);
    gridHelper.position.y = -0.1;
    rootGroup.add(gridHelper);

    // Outer perimeter ring with warm gold illumination
    const perimeterGeom = new THREE.RingGeometry(68, 70, 64);
    const perimeterMat = new THREE.MeshBasicMaterial({
      color: 0xf0d28f,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.22
    });
    const perimeterMesh = new THREE.Mesh(perimeterGeom, perimeterMat);
    perimeterMesh.rotation.x = Math.PI / 2;
    perimeterMesh.position.y = 0.05;
    rootGroup.add(perimeterMesh);

    // -------------------------------------------------------------
    // LEVEL 2: OMEGA TOWER (5-Floor Architectural Mesh)
    // -------------------------------------------------------------
    const floorHeights = [2, 8, 15, 22, 29];
    const floorWidth = 40;
    const floorDepth = 28;

    floorHeights.forEach((elevation, idx) => {
      const floorNum = idx + 1;
      const isFloor4 = floorNum === 4;
      const isFloor5 = floorNum === 5;

      // Slab mesh (Polished Obsidian Bronze)
      const slabGeom = new THREE.BoxGeometry(floorWidth, 0.8, floorDepth);
      const slabMat = new THREE.MeshStandardMaterial({
        color: isFloor4 ? 0x2e110b : isFloor5 ? 0x24180d : 0x16100a,
        roughness: 0.3,
        metalness: 0.7,
        wireframe: wireframeMode
      });
      const slab = new THREE.Mesh(slabGeom, slabMat);
      slab.position.set(0, elevation, 0);
      rootGroup.add(slab);

      // Warm illuminated edge trim
      const edges = new THREE.EdgesGeometry(slabGeom);
      const lineMat = new THREE.LineBasicMaterial({
        color: isFloor4 ? 0xe5502f : isFloor5 ? 0xf0d28f : 0xc9a15d,
        transparent: true,
        opacity: isFloor4 ? 0.9 : 0.45
      });
      const wireframeLines = new THREE.LineSegments(edges, lineMat);
      wireframeLines.position.set(0, elevation, 0);
      rootGroup.add(wireframeLines);

      // Floor 4 Compromise Marker & Threat Field
      if (isFloor4) {
        const breachGeom = new THREE.RingGeometry(2, 7, 32);
        const breachMat = new THREE.MeshBasicMaterial({
          color: 0xe5502f,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4
        });
        const breachRing = new THREE.Mesh(breachGeom, breachMat);
        breachRing.rotation.x = Math.PI / 2;
        breachRing.position.set(6, elevation + 0.5, -4);
        rootGroup.add(breachRing);
        pulseRingsRef.current.push(breachRing);
      }

      // Floor 5 Vault Target Zone
      if (isFloor5) {
        const vaultGeom = new THREE.BoxGeometry(14, 4, 12);
        const vaultMat = new THREE.MeshStandardMaterial({
          color: 0x3d2813,
          transparent: true,
          opacity: 0.65,
          roughness: 0.2,
          metalness: 0.9
        });
        const vault = new THREE.Mesh(vaultGeom, vaultMat);
        vault.position.set(-6, elevation + 2, 4);
        rootGroup.add(vault);
      }
    });

    // -------------------------------------------------------------
    // Animation Loop
    // -------------------------------------------------------------
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      currentCamLook.current.lerp(targetCamLook.current, 0.05);

      const x = currentCamLook.current.x + spherical.current.radius * Math.sin(spherical.current.phi) * Math.sin(spherical.current.theta);
      const y = currentCamLook.current.y + spherical.current.radius * Math.cos(spherical.current.phi);
      const z = currentCamLook.current.z + spherical.current.radius * Math.sin(spherical.current.phi) * Math.cos(spherical.current.theta);

      camera.position.set(x, y, z);
      camera.lookAt(currentCamLook.current);

      // Pulsing threat effect
      pulseRingsRef.current.forEach((ring) => {
        const scale = 1 + 0.2 * Math.sin(elapsedTime * 4);
        ring.scale.set(scale, scale, scale);
      });

      // Subtle slow yaw drift when idle
      if (!isDragging.current) {
        spherical.current.theta += 0.0015;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse Drag Controls
    const domCanvas = canvasRef.current;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;

      spherical.current.theta -= dx * 0.008;
      spherical.current.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.current.phi - dy * 0.008));

      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.current.radius = Math.max(20, Math.min(180, spherical.current.radius + e.deltaY * 0.05));
    };

    domCanvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domCanvas.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = 480;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      domCanvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domCanvas.removeEventListener('wheel', handleWheel);
      renderer.dispose();
    };
  }, [setCameraView, wireframeMode]);

  return (
    <div ref={mountRef} className="relative w-full rounded-3xl bg-[#0a0704] border border-[#c9a15d]/30 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-[480px] block cursor-grab active:cursor-grabbing" />

      {/* Top HUD Overlay */}
      <div className="absolute top-3 left-4 right-4 flex flex-wrap items-center justify-between pointer-events-none gap-2">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-bold tracking-wider bg-rose-950/80 text-rose-300 border border-rose-500/50 flex items-center space-x-1.5 shadow-sm">
            <Radio className="w-3 h-3 animate-pulse text-rose-400" />
            <span>INCIDENT DIGITAL TWIN: OMEGA TOWER</span>
          </span>

          <span className="px-3 py-1 rounded-xl text-[10px] font-mono font-semibold bg-[#140e08]/90 text-[#f0d28f] border border-[#c9a15d]/30 backdrop-blur-md">
            SITUATION: {activeSituationId}
          </span>
        </div>

        {/* View Level Stepper (Global -> Building -> Floor -> Zone) */}
        <div className="flex items-center bg-[#120c06]/90 p-1 rounded-xl border border-[#c9a15d]/30 pointer-events-auto backdrop-blur-md shadow-md">
          <button
            onClick={() => setCameraView('GLOBAL')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLevel === 'GLOBAL'
                ? 'bg-[#3a2814] text-[#fff6e4] border border-[#f0d28f]/50'
                : 'text-[#a3927a] hover:text-[#fff6e4]'
            }`}
          >
            L1: CAMPUS
          </button>
          <button
            onClick={() => setCameraView('BUILDING')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLevel === 'BUILDING'
                ? 'bg-gradient-to-r from-[#c9a15d] to-[#f0d28f] text-[#050403] shadow-sm font-black'
                : 'text-[#a3927a] hover:text-[#fff6e4]'
            }`}
          >
            L2: TOWER
          </button>
          <button
            onClick={() => setCameraView('FLOOR_4')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLevel === 'FLOOR_4'
                ? 'bg-rose-950/90 border border-rose-500/60 text-rose-300 shadow-sm font-black'
                : 'text-[#a3927a] hover:text-rose-400'
            }`}
          >
            L3: FLOOR 4 (BREACH)
          </button>
          <button
            onClick={() => setCameraView('FLOOR_5')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              currentLevel === 'FLOOR_5'
                ? 'bg-[#3a2814] text-[#f0d28f] border border-[#f0d28f]/60'
                : 'text-[#a3927a] hover:text-[#f0d28f]'
            }`}
          >
            L3: FLOOR 5 (TARGET)
          </button>
        </div>
      </div>

      {/* Floating Spatial Inspection Drawer (Bottom Left) */}
      {selectedEntityInfo && (
        <div className="absolute bottom-4 left-4 max-w-md bg-[#0a0704]/95 border border-[#c9a15d]/35 rounded-2xl p-4 backdrop-blur-2xl shadow-2xl pointer-events-auto space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Crosshair className="w-3.5 h-3.5 text-[#f0d28f]" />
              <span className="text-[10px] font-mono uppercase text-[#a3927a]">
                SPATIAL INSPECTION // {selectedEntityInfo.type}
              </span>
            </div>
            {selectedEntityInfo.status && (
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  selectedEntityInfo.status === 'ACTIVE_BREACH'
                    ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50'
                    : 'bg-[#1e150a] text-[#f0d28f] border border-[#c9a15d]/30'
                }`}
              >
                {selectedEntityInfo.status}
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-[#fff6e4] font-mono">{selectedEntityInfo.name}</h4>
          <p className="text-[11px] text-[#a3927a] leading-relaxed font-sans">{selectedEntityInfo.details}</p>
        </div>
      )}

      {/* Floating 3D Controls (Bottom Right) */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={() => setWireframeMode(!wireframeMode)}
          className={`p-2 rounded-xl border text-xs font-mono flex items-center space-x-1.5 backdrop-blur-md transition-colors cursor-pointer ${
            wireframeMode
              ? 'bg-[#3a2814] border-[#f0d28f]/50 text-[#fff6e4]'
              : 'bg-[#140e08]/90 border-[#c9a15d]/25 text-[#a3927a] hover:text-white'
          }`}
          title="Toggle Wireframe Architecture"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">WIREFRAME</span>
        </button>

        <button
          onClick={() => setCameraView('BUILDING')}
          className="p-2 rounded-xl bg-[#140e08]/90 border border-[#c9a15d]/25 text-[#a3927a] hover:text-white backdrop-blur-md transition-colors cursor-pointer"
          title="Reset Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-xl bg-[#120c06]/95 border border-[#c9a15d]/30 text-[10px] font-mono text-[#d5c7b3]">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>THREAT PROPAGATION: F4 → F5 (+45s)</span>
        </div>
      </div>
    </div>
  );
};
