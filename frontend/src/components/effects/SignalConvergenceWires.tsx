import React, { useEffect, useRef } from 'react';

interface SignalConvergenceWiresProps {
  onIncidentFlash?: () => void;
  className?: string;
}

export const SignalConvergenceWires: React.FC<SignalConvergenceWiresProps> = ({
  onIncidentFlash,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const cv = canvasRef.current;
    if (!container || !cv) return;

    const ctx = cv.getContext('2d');
    if (!ctx) return;

    const COLORS = ['#5b8def', '#e8b25c', '#26a88a', '#d9669f']; // CCTV, Network, Access, OSINT
    const cards = container.querySelectorAll<HTMLElement>('.signal-card');
    const node = container.querySelector<HTMLElement>('.incident-hub');

    if (cards.length === 0 || !node) return;

    let paths: { pts: [number, number][]; len: number[]; total: number }[] = [];
    let dpr = 1;

    const build = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const box = container.getBoundingClientRect();
      cv.width = box.width * dpr;
      cv.height = box.height * dpr;

      const nb = node.getBoundingClientRect();
      const ex = nb.left - box.left + 20;
      const ey = nb.top - box.top + nb.height / 2;

      paths = Array.from(cards).map((c, i) => {
        const b = c.getBoundingClientRect();
        const x0 = b.left - box.left + b.width / 2;
        const y0 = b.bottom - box.top;
        const bus = y0 + 14 + i * 8;
        const r = 10;
        const xe = ex - 24;

        const pts: [number, number][] = [[x0, y0], [x0, bus - r]];
        for (let s = 1; s <= 8; s++) {
          const a = (s / 8) * Math.PI / 2;
          pts.push([x0 + r - r * Math.cos(a), bus - r + r * Math.sin(a)]);
        }
        pts.push([xe, bus]);
        for (let s = 1; s <= 16; s++) {
          const t = s / 16;
          const u = 1 - t;
          pts.push([
            u * u * u * xe + 3 * u * u * t * (xe + 18) + 3 * u * t * t * (ex - 12) + t * t * t * ex,
            u * u * u * bus + 3 * u * u * t * bus + 3 * u * t * t * ey + t * t * t * ey
          ]);
        }

        const len = [0];
        for (let k = 1; k < pts.length; k++) {
          len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
        }
        return { pts, len, total: len[len.length - 1] };
      });
    };

    const at = (p: { pts: [number, number][]; len: number[]; total: number }, d: number): [number, number] => {
      d = Math.max(0, Math.min(p.total, d));
      let k = 1;
      while (k < p.len.length - 1 && p.len[k] < d) k++;
      const f = (d - p.len[k - 1]) / Math.max(1e-6, p.len[k] - p.len[k - 1]);
      const a = p.pts[k - 1];
      const b = p.pts[k];
      return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
    };

    const stroke = (p: { pts: [number, number][]; len: number[]; total: number }, d0: number, d1: number) => {
      ctx.beginPath();
      const steps = Math.max(2, Math.ceil((d1 - d0) / 4));
      for (let s = 0; s <= steps; s++) {
        const q = at(p, d0 + (d1 - d0) * (s / steps));
        if (s === 0) ctx.moveTo(q[0], q[1]);
        else ctx.lineTo(q[0], q[1]);
      }
      ctx.stroke();
    };

    interface Pulse {
      i: number;
      t0: number;
      dur: number;
      die: number;
      fused: boolean;
    }

    const pulses: Pulse[] = [];
    let nextLone = 500;
    let nextFuse = 2000;
    let raf = 0;

    const emit = (i: number, fused: boolean, now: number) => {
      pulses.push({
        i,
        t0: now,
        dur: fused ? 1600 : 1400 + Math.random() * 400,
        die: fused ? 1.01 : 0.35 + Math.random() * 0.3,
        fused
      });
    };

    const frame = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Background bus traces
      ctx.strokeStyle = 'rgba(201, 161, 93, 0.15)';
      ctx.lineWidth = 1.25;
      paths.forEach((p) => stroke(p, 0, p.total));

      if (now > nextLone) {
        emit((Math.random() * cards.length) | 0, false, now);
        nextLone = now + 400 + Math.random() * 800;
      }
      if (now > nextFuse) {
        cards.forEach((_, i) => emit(i, true, now));
        nextFuse = now + 3800 + Math.random() * 1200;
      }

      let arrived = 0;
      for (let k = pulses.length - 1; k >= 0; k--) {
        const u = pulses[k];
        if (u.i >= paths.length) continue;
        const p = paths[u.i];
        const prog = (now - u.t0) / u.dur;
        const e = u.fused ? 1 - Math.pow(1 - Math.min(1, prog), 2.2) : prog;

        if (prog >= 1 || e > u.die + 0.12) {
          if (u.fused && prog >= 1) arrived++;
          pulses.splice(k, 1);
          continue;
        }

        const fade = u.fused ? 1 : Math.max(0, Math.min(1, (u.die + 0.12 - e) / 0.12));
        const d = e * p.total;
        ctx.globalAlpha = fade;
        ctx.strokeStyle = COLORS[u.i % COLORS.length];
        ctx.lineWidth = 2.4;
        stroke(p, Math.max(0, d - 40), d);

        const hd = at(p, d);
        ctx.fillStyle = COLORS[u.i % COLORS.length];
        ctx.beginPath();
        ctx.arc(hd[0], hd[1], 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      if (arrived && onIncidentFlash) {
        onIncidentFlash();
      }

      raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => build());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [onIncidentFlash]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      />
    </div>
  );
};
