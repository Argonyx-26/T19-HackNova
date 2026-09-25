"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

export interface GlobeThreat {
  id: string
  type: 'situation' | 'cctv' | 'network' | 'access' | 'earthquake'
  name: string
  severity: string
  coordinates: [number, number] // [lng, lat]
  description?: string
  color?: string
}

interface RotatingEarthProps {
  width?: number
  height?: number
  className?: string
  activeSituation?: any
  threats?: GlobeThreat[]
  onSelectThreat?: (threat: GlobeThreat) => void
}

// Built-in simplified world land polygons for INSTANT zero-network rendering
const EMBEDDED_WORLD_POLYGONS: [number, number][][] = [
  // North America
  [[-168, 65], [-140, 70], [-100, 72], [-60, 60], [-55, 48], [-75, 38], [-80, 25], [-98, 20], [-105, 20], [-117, 32], [-124, 38], [-125, 50], [-140, 58], [-168, 65]],
  // South America
  [[-80, 8], [-60, 10], [-35, -5], [-38, -15], [-55, -30], [-65, -55], [-75, -45], [-80, -20], [-80, 8]],
  // Europe
  [[-10, 36], [0, 44], [15, 40], [28, 41], [30, 60], [25, 70], [10, 62], [-5, 58], [-10, 36]],
  // Africa
  [[-15, 35], [10, 37], [32, 31], [42, 12], [50, 10], [35, -25], [20, -35], [12, -15], [0, 5], [-17, 15], [-15, 35]],
  // Asia
  [[30, 60], [60, 70], [100, 75], [140, 70], [170, 65], [142, 45], [130, 32], [105, 20], [80, 10], [70, 25], [50, 30], [35, 40], [30, 60]],
  // Australia
  [[115, -22], [130, -12], [145, -15], [153, -28], [140, -38], [115, -35], [115, -22]]
];

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
  activeSituation,
  threats = [],
  onSelectThreat
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const threatsRef = useRef<GlobeThreat[]>([])
  const onSelectThreatRef = useRef(onSelectThreat)
  const [selectedThreat, setSelectedThreat] = useState<GlobeThreat | null>(null)

  // Keep refs up to date without triggering useEffect restarts
  onSelectThreatRef.current = onSelectThreat

  // Compile active threats
  threatsRef.current = threats.length > 0 ? threats : [
    {
      id: activeSituation?.situation_id || 'sit-20260925-001',
      type: 'situation',
      name: 'SENTINEL-X SITUATION-001',
      severity: activeSituation?.status || 'CRITICAL',
      coordinates: [-122.4194, 37.7749], // Orion Research Campus, SF Bay Area
      description: 'Active Perimeter & Vault Breach (Risk 92)',
      color: '#ef4444'
    },
    {
      id: 'cctv-vault-01',
      type: 'cctv',
      name: 'CCTV-04 (Server Vault)',
      severity: 'HIGH',
      coordinates: [-122.45, 37.80],
      description: 'Unauthorized biometrics confirmed',
      color: '#06b6d4'
    },
    {
      id: 'ids-sw-08',
      type: 'network',
      name: 'IDS Core Switch 08',
      severity: 'HIGH',
      coordinates: [-122.38, 37.75],
      description: 'Port scan & lateral packet spike',
      color: '#f59e0b'
    },
    {
      id: 'quake-taiwan',
      type: 'earthquake',
      name: 'USGS M5.4 Earthquake',
      severity: 'MEDIUM',
      coordinates: [121.55, 23.95],
      description: 'Depth 10.2 km',
      color: '#fb923c'
    }
  ]

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40)
    const containerHeight = Math.min(height, window.innerHeight - 100)
    const radius = Math.min(containerWidth, containerHeight) / 2.3

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Initial rotation centered around North America / Pacific to highlight the threat immediately
    const rotation: [number, number] = [115, -30]
    let autoRotate = true
    const rotationSpeed = 0.28
    let pulseStep = 0

    // Create orthographic projection
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)
      .rotate(rotation)

    const path = d3.geoPath().projection(projection).context(context)

    // Pre-generate grid dots along latitude / longitude lines for fast instant rendering
    const gridDots: [number, number][] = []
    for (let lat = -70; lat <= 70; lat += 7) {
      for (let lng = -180; lng < 180; lng += 10) {
        gridDots.push([lng, lat])
      }
    }

    let detailedGeoJSON: any = null

    // Load full GeoJSON in background without blocking or showing loader
    fetch("https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          detailedGeoJSON = data
        }
      })
      .catch(() => {})

    // MAIN ANIMATION LOOP
    const render = () => {
      pulseStep = (pulseStep + 1) % 360

      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius
      const currentRotation = projection.rotate()

      // Calculate the visible hemisphere center
      const centerLng = -currentRotation[0]
      const centerLat = -currentRotation[1]

      // 1. Deep Space Atmosphere Glow
      context.save()
      const spaceGlow = context.createRadialGradient(
        containerWidth / 2, containerHeight / 2, currentScale * 0.75,
        containerWidth / 2, containerHeight / 2, currentScale * 1.15
      )
      spaceGlow.addColorStop(0, "#030612")
      spaceGlow.addColorStop(0.85, "#060e24")
      spaceGlow.addColorStop(1, "#38bdf820")

      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = spaceGlow
      context.fill()
      context.strokeStyle = "#38bdf888"
      context.lineWidth = 1.8 * scaleFactor
      context.stroke()
      context.restore()

      // 2. Graticule (Lat/Long Grid)
      context.save()
      const graticule = d3.geoGraticule().step([20, 20])
      context.beginPath()
      path(graticule())
      context.strokeStyle = "#334155"
      context.lineWidth = 0.9 * scaleFactor
      context.globalAlpha = 0.4
      context.stroke()
      context.restore()

      // 3. Land Masses
      context.save()
      if (detailedGeoJSON) {
        context.beginPath()
        path(detailedGeoJSON)
        context.strokeStyle = "#94a3b8"
        context.lineWidth = 1.2 * scaleFactor
        context.fillStyle = "#0f172a"
        context.globalAlpha = 0.55
        context.fill()
        context.stroke()
      } else {
        // Instant embedded continent rendering
        EMBEDDED_WORLD_POLYGONS.forEach((coords) => {
          context.beginPath()
          const geoFeature = {
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [coords]
            }
          }
          path(geoFeature as any)
          context.strokeStyle = "#94a3b8"
          context.lineWidth = 1.2 * scaleFactor
          context.fillStyle = "#0f172a"
          context.globalAlpha = 0.55
          context.fill()
          context.stroke()
        })
      }
      context.restore()

      // 4. Dot Matrix Overlay
      context.save()
      context.fillStyle = "#64748b"
      context.globalAlpha = 0.65
      gridDots.forEach(([lng, lat]) => {
        if (d3.geoDistance([centerLng, centerLat], [lng, lat]) < Math.PI / 2.05) {
          const pt = projection([lng, lat])
          if (pt) {
            context.beginPath()
            context.arc(pt[0], pt[1], 1.0 * scaleFactor, 0, 2 * Math.PI)
            context.fill()
          }
        }
      })
      context.restore()

      // ==============================================================
      // 5. THREAT DETECTION LAYER (PROJECTION ON ROTATING 3D SPHERE)
      // ==============================================================
      const currentThreats = threatsRef.current
      currentThreats.forEach((threat) => {
        const [tLng, tLat] = threat.coordinates

        // Check if threat coordinate is on the visible front hemisphere
        const distanceToCenter = d3.geoDistance([centerLng, centerLat], [tLng, tLat])
        const isVisible = distanceToCenter < Math.PI / 2.1

        if (!isVisible) return

        const projected = projection([tLng, tLat])
        if (!projected) return

        const [tx, ty] = projected
        const isPrimary = threat.type === 'situation'
        const baseColor = isPrimary ? '#ef4444' : threat.color || '#f59e0b'

        context.save()

        // A. Expanding Pulsing Radar Waves
        const pulseProgress1 = (pulseStep % 60) / 60
        const pulseProgress2 = ((pulseStep + 30) % 60) / 60

        // Radar wave 1
        context.beginPath()
        context.arc(tx, ty, (8 + pulseProgress1 * (isPrimary ? 42 : 24)) * scaleFactor, 0, 2 * Math.PI)
        context.strokeStyle = baseColor
        context.lineWidth = (isPrimary ? 2.5 : 1.5) * scaleFactor
        context.globalAlpha = Math.max(0, 1 - pulseProgress1) * 0.95
        context.stroke()

        // Radar wave 2
        context.beginPath()
        context.arc(tx, ty, (8 + pulseProgress2 * (isPrimary ? 42 : 24)) * scaleFactor, 0, 2 * Math.PI)
        context.strokeStyle = isPrimary ? "#f87171" : baseColor
        context.lineWidth = (isPrimary ? 1.8 : 1.2) * scaleFactor
        context.globalAlpha = Math.max(0, 1 - pulseProgress2) * 0.75
        context.stroke()

        // B. Target Reticle Brackets (for Primary Situation Threat)
        if (isPrimary) {
          context.globalAlpha = 1
          context.strokeStyle = "#fca5a5"
          context.lineWidth = 2 * scaleFactor
          const bSize = 16 * scaleFactor

          // 4 Corner Brackets
          // Top-Left
          context.beginPath()
          context.moveTo(tx - bSize, ty - bSize + 6)
          context.lineTo(tx - bSize, ty - bSize)
          context.lineTo(tx - bSize + 6, ty - bSize)
          context.stroke()

          // Top-Right
          context.beginPath()
          context.moveTo(tx + bSize - 6, ty - bSize)
          context.lineTo(tx + bSize, ty - bSize)
          context.lineTo(tx + bSize, ty - bSize + 6)
          context.stroke()

          // Bottom-Left
          context.beginPath()
          context.moveTo(tx - bSize, ty + bSize - 6)
          context.lineTo(tx - bSize, ty + bSize)
          context.lineTo(tx - bSize + 6, ty + bSize)
          context.stroke()

          // Bottom-Right
          context.beginPath()
          context.moveTo(tx + bSize - 6, ty + bSize)
          context.lineTo(tx + bSize, ty + bSize)
          context.lineTo(tx + bSize, ty + bSize - 6)
          context.stroke()
        }

        // C. Core Glowing Threat Beacon Dot
        context.globalAlpha = 1
        context.beginPath()
        context.arc(tx, ty, (isPrimary ? 7.5 : 5.0) * scaleFactor, 0, 2 * Math.PI)
        context.fillStyle = baseColor
        context.fill()
        context.strokeStyle = "#ffffff"
        context.lineWidth = 2.2 * scaleFactor
        context.stroke()

        // D. Illuminated HUD Callout Box & Leader Line
        const tagOffsetX = 30 * scaleFactor
        const tagOffsetY = -30 * scaleFactor
        const tagX = tx + tagOffsetX
        const tagY = ty + tagOffsetY

        // Angled Leader Line
        context.beginPath()
        context.moveTo(tx, ty)
        context.lineTo(tagX, tagY)
        context.lineTo(tagX + (isPrimary ? 80 : 50) * scaleFactor, tagY)
        context.strokeStyle = baseColor
        context.lineWidth = 1.6 * scaleFactor
        context.globalAlpha = 0.95
        context.stroke()

        // HUD Tag Background
        const badgeWidth = (isPrimary ? 175 : 130) * scaleFactor
        const badgeHeight = (isPrimary ? 42 : 28) * scaleFactor

        context.fillStyle = isPrimary ? "#1b060a" : "#080e1c"
        context.strokeStyle = baseColor
        context.lineWidth = 1.4 * scaleFactor
        context.globalAlpha = 0.95
        context.fillRect(tagX, tagY - badgeHeight / 2, badgeWidth, badgeHeight)
        context.strokeRect(tagX, tagY - badgeHeight / 2, badgeWidth, badgeHeight)

        // Title
        context.globalAlpha = 1
        context.font = `bold ${Math.max(10, 11 * scaleFactor)}px monospace`
        context.fillStyle = isPrimary ? "#fecaca" : "#e2e8f0"
        context.fillText(
          `${isPrimary ? '🔴 THREAT: ' : '● '}${threat.name}`,
          tagX + 8 * scaleFactor,
          tagY - 4 * scaleFactor
        )

        // Subtitle
        context.font = `${Math.max(8.5, 9.5 * scaleFactor)}px monospace`
        context.fillStyle = isPrimary ? "#ef4444" : "#94a3b8"
        context.fillText(
          `${threat.severity} • ${threat.description || 'Active Alert'}`,
          tagX + 8 * scaleFactor,
          tagY + 12 * scaleFactor
        )

        context.restore()
      })
    }

    // Animation timer
    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
      }
      render()
    }

    const timer = d3.timer(rotate)

    // User Mouse Handlers
    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY
        rotation[0] = startRotation[0] + dx * 0.4
        rotation[1] = Math.max(-85, Math.min(85, startRotation[1] - dy * 0.4))
        projection.rotate(rotation)
      }

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        setTimeout(() => {
          autoRotate = true
        }, 3000)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      const factor = event.deltaY > 0 ? 0.92 : 1.08
      const newRadius = Math.max(radius * 0.65, Math.min(radius * 2.8, projection.scale() * factor))
      projection.scale(newRadius)
    }

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const currentRotation = projection.rotate()
      const centerLng = -currentRotation[0]
      const centerLat = -currentRotation[1]

      for (const threat of threatsRef.current) {
        const [tLng, tLat] = threat.coordinates
        if (d3.geoDistance([centerLng, centerLat], [tLng, tLat]) < Math.PI / 2) {
          const projected = projection([tLng, tLat])
          if (projected) {
            const dist = Math.hypot(mouseX - projected[0], mouseY - projected[1])
            if (dist < 35) {
              setSelectedThreat(threat)
              if (onSelectThreatRef.current) onSelectThreatRef.current(threat)
              return
            }
          }
        }
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel)
    canvas.addEventListener("click", handleClick)

    return () => {
      timer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("click", handleClick)
    }
  }, [width, height]) // Depend ONLY on dimensions; threats are read via ref

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Top Threat Lock HUD Banner */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none font-mono">
        <div className="flex items-center space-x-2 bg-red-950/90 border border-red-600/90 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs text-red-200 font-bold uppercase tracking-wider">
            THREAT LOCK: 1 ACTIVE SITUATION (CRITICAL)
          </span>
        </div>
        <div className="text-[10px] text-cyan-400 mt-1 pl-1 font-semibold">
          TARGET: ORION RESEARCH COMPLEX [37.77° N, 122.41° W]
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl bg-transparent cursor-grab active:cursor-grabbing"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="absolute bottom-4 left-4 flex items-center space-x-3 text-xs text-neutral-300 px-3 py-1.5 rounded-md bg-neutral-900/95 border border-neutral-800 backdrop-blur-sm font-mono z-20 shadow-xl">
        <span className="flex items-center space-x-1.5 text-red-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>Click threat beacon to inspect</span>
        </span>
        <span className="text-neutral-600">|</span>
        <span className="text-neutral-400">Drag to rotate • Scroll to zoom</span>
      </div>

      {selectedThreat && (
        <div className="absolute bottom-4 right-4 bg-[#120407]/95 border border-red-600 p-3.5 rounded-xl font-mono text-xs shadow-2xl z-30 max-w-xs">
          <div className="flex items-center justify-between text-red-400 font-bold mb-1">
            <span>{selectedThreat.name}</span>
            <span className="px-1.5 py-0.5 rounded bg-red-950 border border-red-800 text-[10px]">
              {selectedThreat.severity}
            </span>
          </div>
          <div className="text-neutral-200 text-[11px] mb-2">{selectedThreat.description}</div>
          <div className="text-neutral-400 text-[10px] pt-1 border-t border-neutral-800">
            COORDS: {selectedThreat.coordinates[1]}° N, {selectedThreat.coordinates[0]}° W
          </div>
        </div>
      )}
    </div>
  )
}
