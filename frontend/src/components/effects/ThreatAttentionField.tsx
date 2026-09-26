import React, { useEffect, useRef } from 'react';
import type { SituationState } from '../../types';

interface ThreatAttentionFieldProps {
  activeState?: SituationState;
  className?: string;
}

export const ThreatAttentionField: React.FC<ThreatAttentionFieldProps> = ({
  activeState = 'CRITICAL',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const gl = cv.getContext('webgl', { antialias: false, alpha: true, powerPreference: 'low-power' });
    if (!gl) return;

    const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const FS = `precision mediump float;
uniform vec2 R;uniform float T;uniform vec2 M;uniform vec3 SCol;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float b2(vec2 a){a=floor(a);return fract(dot(a,vec2(.5,a.y*.75)));}
float b4(vec2 a){return b2(.5*a)*.25+b2(a);}
float b8(vec2 a){return b4(.5*a)*.25+b2(a);}
void main(){
  vec2 uv=gl_FragCoord.xy/R;vec2 S=R/min(R.x,R.y)*2.4;vec2 p=uv*S;float t=T*.045;
  vec2 q=vec2(fbm(p+t),fbm(p+vec2(5.2,1.3)-t));
  float f=fbm(p+2.4*q+vec2(t*.7,-t*.4));
  vec2 m=M*S;float d=length(p-m);
  float gaze=exp(-d*d*1.5);
  float ring=exp(-pow((d-.55-.03*sin(T*.9))*9.,2.));
  float v=smoothstep(.32,.95,f)*.62+gaze*.28+ring*(.42+.2*f);
  v*=mix(.2,1.,smoothstep(.1,.3,d));
  v*=(.18+.82*smoothstep(.05,.95,uv.x))*(.35+.65*smoothstep(0.,.85,uv.y));
  float lv=clamp(floor(v*4.+b8(gl_FragCoord.xy)-.25),0.,3.);
  
  vec3 c=vec3(.02,.015,.01);
  if(lv>.5) c=vec3(.08,.055,.03);
  if(lv>1.5) c=mix(vec3(.18,.12,.06), SCol * 0.4, 0.5);
  if(lv>2.5) c=mix(vec3(.32,.22,.10), SCol, 0.85);
  gl_FragColor=vec4(c, 0.45);
}`;

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vs = sh(gl.VERTEX_SHADER, VS);
    const fs = sh(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const pr = gl.createProgram();
    if (!pr) return;
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);

    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) {
      return;
    }

    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(pr, 'R');
    const uT = gl.getUniformLocation(pr, 'T');
    const uM = gl.getUniformLocation(pr, 'M');
    const uSCol = gl.getUniformLocation(pr, 'SCol');

    const CELL = 3; // dither pixelation factor
    const rest = [0.75, 0.7];
    const mouse = [...rest];
    const aim = [...rest];

    const getStateRGB = (st: SituationState): [number, number, number] => {
      switch (st) {
        case 'CRITICAL': return [0.76, 0.12, 0.17];
        case 'ESCALATING': return [0.90, 0.31, 0.18];
        case 'SUSPICIOUS': return [0.88, 0.51, 0.18];
        case 'ANOMALOUS': return [0.88, 0.70, 0.24];
        case 'NORMAL': return [0.25, 0.68, 0.39];
        default: return [0.79, 0.63, 0.36];
      }
    };

    const size = () => {
      const parent = cv.parentElement;
      if (!parent) return;
      cv.width = Math.max(10, Math.ceil(parent.clientWidth / CELL));
      cv.height = Math.max(10, Math.ceil(parent.clientHeight / CELL));
      gl.viewport(0, 0, cv.width, cv.height);
    };

    let prev = 0;
    const draw = (now: number) => {
      const k = prev ? 1 - Math.exp(-Math.min(100, now - prev) / 320) : 0;
      prev = now;
      mouse[0] += (aim[0] - mouse[0]) * k;
      mouse[1] += (aim[1] - mouse[1]) * k;

      gl.uniform2f(uR, cv.width, cv.height);
      gl.uniform1f(uT, now / 1000);
      gl.uniform2f(uM, mouse[0], mouse[1]);

      const [r, g, b] = getStateRGB(activeState);
      gl.uniform3f(uSCol, r, g, b);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    size();
    draw(9000);

    const resizeObserver = new ResizeObserver(() => {
      size();
      draw(performance.now() + 9000);
    });
    if (cv.parentElement) resizeObserver.observe(cv.parentElement);

    const handlePointerMove = (e: MouseEvent) => {
      const parent = cv.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      aim[0] = (e.clientX - r.left) / r.width;
      aim[1] = 1 - (e.clientY - r.top) / r.height;
    };

    const handlePointerLeave = () => {
      aim[0] = rest[0];
      aim[1] = rest[1];
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    let visible = true;
    let raf = 0;
    const loop = (now: number) => {
      draw(now + 9000);
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      wake();
    });
    io.observe(cv);

    document.addEventListener('visibilitychange', wake);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [activeState]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full image-render-pixelated opacity-65 ${className}`}
      style={{
        imageRendering: 'pixelated',
        maskImage: 'linear-gradient(180deg, #000 65%, transparent)',
        WebkitMaskImage: 'linear-gradient(180deg, #000 65%, transparent)'
      }}
    />
  );
};
