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

export default function RotatingEarth({
  width = 800,
  height = 600,
  className = "",
  activeSituation,
  threats = [],
  onSelectThreat
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredThreat, setHoveredThreat] = useState<GlobeThreat | null>(null)

  // Default active SENTINEL-X threat if none provided
  const activeThreats: GlobeThreat[] = threats.length > 0 ? threats : [
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
      description: 'Port scan & exfiltration packet spike',
      color: '#f59e0b'
    },
    {
      id: 'quake-taiwan',
      type: 'earthquake',
      name: 'USGS M5.4 Earthquake',
      severity: 'MEDIUM',
      coordinates: [121.55, 23.95], // Taiwan
      description: 'Depth 10.2 km',
      color: '#fb923c'
    },
    {
      id: 'quake-papua',
      type: 'earthquake',
      name: 'USGS M4.8 Earthquake',
      severity: 'LOW',
      coordinates: [152.85, -4.55], // Papua New Guinea
      description: 'Depth 42.0 km',
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
    const radius = Math.min(containerWidth, containerHeight) / 2.4

    const dpr = window.devicePixelRatio || 1
    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.scale(dpr, dpr)

    // Initial rotation centered around North America / Pacific to highlight the threat immediately
    const rotation: [number, number] = [100, -25]
    let autoRotate = true
    const rotationSpeed = 0.35
    let pulseStep = 0

    // Create projection and path generator for Canvas
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)
      .rotate(rotation)

    const path = d3.geoPath().projection(projection).context(context)

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point
      let inside = false

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i]
        const [xj, yj] = polygon[j]

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside
        }
      }

      return inside
    }

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates
        if (!pointInPolygon(point, coordinates[0])) return false
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) return false
        }
        return true
      } else if (geometry.type === "MultiPolygon") {
        for (const polygon of geometry.coordinates) {
          if (pointInPolygon(point, polygon[0])) {
            let inHole = false
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true
                break
              }
            }
            if (!inHole) return true
          }
        }
        return false
      }
      return false
    }

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = []
      const bounds = d3.geoBounds(feature)
      const [[minLng, minLat], [maxLng, maxLat]] = bounds
      const stepSize = dotSpacing * 0.08

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat]
          if (pointInFeature(point, feature)) {
            dots.push(point)
          }
        }
      }
      return dots
    }

    interface DotData {
      lng: number
      lat: number
      visible: boolean
    }

    const allDots: DotData[] = []
    let landFeatures: any

    // RENDER FRAME FUNCTION
    const render = () => {
      pulseStep = (pulseStep + 1) % 180

      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight)

      const currentScale = projection.scale()
      const scaleFactor = currentScale / radius
      const currentRotation = projection.rotate()

      // Calculate the visible hemisphere center
      const centerLng = -currentRotation[0]
      const centerLat = -currentRotation[1]

      // 1. Draw outer space glow & ocean sphere
      context.save()
      const gradient = context.createRadialGradient(
        containerWidth / 2, containerHeight / 2, currentScale * 0.8,
        containerWidth / 2, containerHeight / 2, currentScale * 1.05
      )
      gradient.addColorStop(0, "#030611")
      gradient.addColorStop(0.85, "#060c20")
      gradient.addColorStop(1, "#0f1c3f33")

      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.fillStyle = gradient
      context.fill()
      context.strokeStyle = "#38bdf844"
      context.lineWidth = 1.5 * scaleFactor
      context.stroke()
      context.restore()

      if (landFeatures) {
        // 2. Draw graticule
        const graticule = d3.geoGraticule()
        context.beginPath()
        path(graticule())
        context.strokeStyle = "#ffffff"
        context.lineWidth = 0.8 * scaleFactor
        context.globalAlpha = 0.18
        context.stroke()
        context.globalAlpha = 1

        // 3. Draw land outlines
        context.beginPath()
        landFeatures.features.forEach((feature: any) => {
          path(feature)
        })
        context.strokeStyle = "#94a3b8"
        context.lineWidth = 1.0 * scaleFactor
        context.globalAlpha = 0.4
        context.stroke()
        context.globalAlpha = 1

        // 4. Draw halftone dots
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat])
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath()
            context.arc(projected[0], projected[1], 1.1 * scaleFactor, 0, 2 * Math.PI)
            context.fillStyle = "#64748b"
            context.fill()
          }
        })
      }

      // ==============================================================
      // 5. THREAT DETECTION LAYER (PROJECTION ON ROTATING 3D SPHERE)
      // ==============================================================
      activeThreats.forEach((threat) => {
        const [tLng, tLat] = threat.coordinates

        // Check if threat coordinate is on the visible front hemisphere
        const distanceToCenter = d3.geoDistance([centerLng, centerLat], [tLng, tLat])
        const isVisible = distanceToCenter < Math.PI / 2.1 // Slight clip padding for horizon

        if (!isVisible) return

        const projected = projection([tLng, tLat])
        if (!projected) return

        const [tx, ty] = projected

        context.save()

        const isPrimary = threat.type === 'situation'
        const baseColor = isPrimary ? '#ef4444' : threat.color || '#f59e0b'

        // A. Expanding Radar Pulsing Wave
        const pulseProgress = (pulseStep % 60) / 60
        const pulseRadius = (10 + pulseProgress * (isPrimary ? 34 : 20)) * scaleFactor
        const pulseAlpha = Math.max(0, 1 - pulseProgress)

        context.beginPath()
        context.arc(tx, ty, pulseRadius, 0, 2 * Math.PI)
        context.strokeStyle = baseColor
        context.lineWidth = (isPrimary ? 2.2 : 1.4) * scaleFactor
        context.globalAlpha = pulseAlpha * 0.85
        context.stroke()

        // B. Secondary Echo Ring for Primary Situation Threat
        if (isPrimary) {
          const echoProgress = ((pulseStep + 30) % 60) / 60
          const echoRadius = (10 + echoProgress * 34) * scaleFactor
          const echoAlpha = Math.max(0, 1 - echoProgress)

          context.beginPath()
          context.arc(tx, ty, echoRadius, 0, 2 * Math.PI)
          context.strokeStyle = "#f87171"
          context.lineWidth = 1.2 * scaleFactor
          context.globalAlpha = echoAlpha * 0.6
          context.stroke()
        }

        // C. Tactical Target Lock Brackets for Primary Threat
        if (isPrimary) {
          context.globalAlpha = 0.9
          context.strokeStyle = "#f87171"
          context.lineWidth = 1.5 * scaleFactor
          const bSize = 14 * scaleFactor

          // Corner brackets around threat
          // Top-left
          context.beginPath()
          context.moveTo(tx - bSize, ty - bSize + 5)
          context.lineTo(tx - bSize, ty - bSize)
          context.lineTo(tx - bSize + 5, ty - bSize)
          context.stroke()

          // Top-right
          context.beginPath()
          context.moveTo(tx + bSize - 5, ty - bSize)
          context.lineTo(tx + bSize, ty - bSize)
          context.lineTo(tx + bSize, ty - bSize + 5)
          context.stroke()

          // Bottom-left
          context.beginPath()
          context.moveTo(tx - bSize, ty + bSize - 5)
          context.lineTo(tx - bSize, ty + bSize)
          context.lineTo(tx - bSize + 5, ty + bSize)
          context.stroke()

          // Bottom-right
          context.beginPath()
          context.moveTo(tx + bSize - 5, ty + bSize)
          context.lineTo(tx + bSize, ty + bSize)
          context.lineTo(tx + bSize, ty + bSize - 5)
          context.stroke()
        }

        // D. Core Threat Beacon Dot
        context.globalAlpha = 1
        context.beginPath()
        context.arc(tx, ty, (isPrimary ? 6.5 : 4.5) * scaleFactor, 0, 2 * Math.PI)
        context.fillStyle = baseColor
        context.fill()
        context.strokeStyle = "#ffffff"
        context.lineWidth = 1.8 * scaleFactor
        context.stroke()

        // E. Illuminated HUD Callout Box & Leader Line
        const tagOffsetX = 24 * scaleFactor
        const tagOffsetY = -24 * scaleFactor
        const tagX = tx + tagOffsetX
        const tagY = ty + tagOffsetY

        // Draw leader line
        context.beginPath()
        context.moveTo(tx, ty)
        context.lineTo(tagX, tagY)
        context.lineTo(tagX + 65 * scaleFactor, tagY)
        context.strokeStyle = baseColor
        context.lineWidth = 1.2 * scaleFactor
        context.globalAlpha = 0.85
        context.stroke()

        // Draw HUD Callout Badge
        const badgeWidth = isPrimary ? 150 * scaleFactor : 120 * scaleFactor
        const badgeHeight = isPrimary ? 36 * scaleFactor : 24 * scaleFactor

        context.fillStyle = isPrimary ? "#180509ee" : "#0a0f1dee"
        context.strokeStyle = baseColor
        context.lineWidth = 1 * scaleFactor
        context.fillRect(tagX, tagY - badgeHeight / 2, badgeWidth, badgeHeight)
        context.strokeRect(tagX, tagY - badgeHeight / 2, badgeWidth, badgeHeight)

        // Threat Text Label
        context.font = `bold ${Math.max(9, 10 * scaleFactor)}px monospace`
        context.fillStyle = isPrimary ? "#fca5a5" : "#e2e8f0"
        context.fillText(
          `${isPrimary ? '🔴 THREAT: ' : '● '}${threat.name}`,
          tagX + 6 * scaleFactor,
          tagY - 2 * scaleFactor
        )

        // Severity / Status Subtext
        context.font = `${Math.max(8, 8.5 * scaleFactor)}px monospace`
        context.fillStyle = isPrimary ? "#ef4444" : "#94a3b8"
        context.fillText(
          `${threat.severity} • ${threat.description || 'Active Alert'}`,
          tagX + 6 * scaleFactor,
          tagY + 11 * scaleFactor
        )

        context.restore()
      })
    }

    // Load Natural Earth Land Polygon Data
    const loadWorldData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        )
        if (!response.ok) throw new Error("Failed to load land data")

        landFeatures = await response.json()

        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16)
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true })
          })
        })

        render()
        setIsLoading(false)
      } catch (err) {
        console.warn("Using fallback rendering for world map", err)
        setError(null) // Keep rendering sphere even if remote GeoJSON times out
        render()
        setIsLoading(false)
      }
    }

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed
        projection.rotate(rotation)
        render()
      } else {
        render()
      }
    }

    const rotationTimer = d3.timer(rotate)

    // Interactive Mouse Handlers
    const handleMouseDown = (event: MouseEvent) => {
      autoRotate = false
      const startX = event.clientX
      const startY = event.clientY
      const startRotation = [...rotation]

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.4
        const dx = moveEvent.clientX - startX
        const dy = moveEvent.clientY - startY

        rotation[0] = startRotation[0] + dx * sensitivity
        rotation[1] = startRotation[1] - dy * sensitivity
        rotation[1] = Math.max(-85, Math.min(85, rotation[1]))

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
      const scaleFactor = event.deltaY > 0 ? 0.92 : 1.08
      const newRadius = Math.max(radius * 0.6, Math.min(radius * 2.8, projection.scale() * scaleFactor))
      projection.scale(newRadius)
    }

    // Click Detection on Threat Markers
    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const currentRotation = projection.rotate()
      const centerLng = -currentRotation[0]
      const centerLat = -currentRotation[1]

      for (const threat of activeThreats) {
        const [tLng, tLat] = threat.coordinates
        if (d3.geoDistance([centerLng, centerLat], [tLng, tLat]) < Math.PI / 2) {
          const projected = projection([tLng, tLat])
          if (projected) {
            const dist = Math.hypot(mouseX - projected[0], mouseY - projected[1])
            if (dist < 28) {
              setHoveredThreat(threat)
              if (onSelectThreat) onSelectThreat(threat)
              return
            }
          }
        }
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("wheel", handleWheel)
    canvas.addEventListener("click", handleClick)

    loadWorldData()

    return () => {
      rotationTimer.stop()
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("wheel", handleWheel)
      canvas.removeEventListener("click", handleClick)
    }
  }, [width, height, activeThreats, onSelectThreat])

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl z-10">
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>Initializing D3 Orthographic Projection & Threat Feeds...</span>
          </div>
        </div>
      )}

      {/* Floating Tactical Overlay HUD for Threat Identification */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none font-mono">
        <div className="flex items-center space-x-2 bg-red-950/80 border border-red-800/80 px-3 py-1.5 rounded-lg backdrop-blur-md shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-xs text-red-200 font-bold uppercase tracking-wider">
            THREAT LOCK: 1 ACTIVE SITUATION (CRITICAL)
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 mt-1 pl-1">
          LOCATION: ORION RESEARCH COMPLEX [37.77° N, 122.41° W]
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl bg-transparent cursor-grab active:cursor-grabbing"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="absolute bottom-4 left-4 flex items-center space-x-3 text-xs text-neutral-400 px-3 py-1.5 rounded-md bg-neutral-900/90 border border-neutral-800 backdrop-blur-sm font-mono z-20">
        <span className="flex items-center space-x-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span>Click threat beacon to inspect</span>
        </span>
        <span className="text-neutral-600">|</span>
        <span>Drag to rotate • Scroll to zoom</span>
      </div>

      {hoveredThreat && (
        <div className="absolute bottom-4 right-4 bg-neutral-950/95 border border-red-700/80 p-3 rounded-xl font-mono text-xs shadow-2xl z-30 max-w-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between text-red-400 font-bold mb-1">
            <span>{hoveredThreat.name}</span>
            <span className="px-1.5 py-0.5 rounded bg-red-950 text-[10px]">{hoveredThreat.severity}</span>
          </div>
          <div className="text-neutral-300 text-[11px] mb-2">{hoveredThreat.description}</div>
          <div className="text-neutral-500 text-[10px]">
            COORDS: {hoveredThreat.coordinates[1]}° N, {hoveredThreat.coordinates[0]}° W
          </div>
        </div>
      )}
    </div>
  )
}
