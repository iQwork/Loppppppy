export interface Pt {
  x: number;
  y: number;
}

export interface FlowTrackOpts {
  colorStart: string;
  colorEnd: string;
  width?: number;
  pulseSpeed?: number;
  reciprocate?: boolean;
  arrowEnd?: boolean;
  dashed?: boolean;
  alpha?: number;
}

/**
 * Draws a static anatomical flow/motion track with a harmonious gradient,
 * subtle dark contrast shadow, and a smooth white light pulse traveling along the path
 * (zero jitter, zero Math.sin arrow shaking).
 */
export function drawFlowTrack(
  ctx: CanvasRenderingContext2D,
  pts: Pt[],
  t: number,
  opts: FlowTrackOpts,
): void {
  if (pts.length < 2) return;
  const lineW = opts.width ?? 3.2;
  const alpha = opts.alpha ?? 0.9;
  const first = pts[0];
  const last = pts[pts.length - 1];

  const tracePath = () => {
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    if (pts.length === 2) {
      ctx.lineTo(last.x, last.y);
    } else if (pts.length === 3) {
      ctx.quadraticCurveTo(pts[1].x, pts[1].y, last.x, last.y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) * 0.5;
        const my = (pts[i].y + pts[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(last.x, last.y);
    }
  };

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (opts.dashed) ctx.setLineDash([6, 5]);

  // Subtle dark contrast under-stroke for crisp separation over light/dark tissue
  tracePath();
  ctx.strokeStyle = 'rgba(7, 15, 29, 0.55)';
  ctx.lineWidth = lineW + 2.4;
  ctx.stroke();

  // Primary harmonious gradient track
  const grad = ctx.createLinearGradient(first.x, first.y, last.x, last.y);
  grad.addColorStop(0, opts.colorStart);
  grad.addColorStop(1, opts.colorEnd);
  tracePath();
  ctx.strokeStyle = grad;
  ctx.lineWidth = lineW;
  ctx.stroke();
  ctx.setLineDash([]);

  // Measure polyline length for smooth pulse interpolation
  const segLengths: number[] = [];
  let totalLen = 0;
  // Sample dense points along curve for smooth pulse even on curved tracks
  const samples = samplePolyline(pts, 28);
  for (let i = 0; i < samples.length - 1; i++) {
    const d = Math.hypot(samples[i + 1].x - samples[i].x, samples[i + 1].y - samples[i].y);
    segLengths.push(d);
    totalLen += d;
  }

  if (totalLen > 2) {
    const speed = opts.pulseSpeed ?? 0.35;
    const raw = (t * speed) % 1;
    const u = opts.reciprocate ? 0.5 - 0.5 * Math.cos(raw * Math.PI * 2) : raw;
    const targetDist = u * totalLen;

    let acc = 0;
    let px = first.x;
    let py = first.y;
    for (let i = 0; i < segLengths.length; i++) {
      const sl = segLengths[i];
      if (acc + sl >= targetDist || i === segLengths.length - 1) {
        const localT = sl > 0 ? Math.min(1, Math.max(0, (targetDist - acc) / sl)) : 0;
        px = samples[i].x + (samples[i + 1].x - samples[i].x) * localT;
        py = samples[i].y + (samples[i + 1].y - samples[i].y) * localT;
        break;
      }
      acc += sl;
    }

    // Smooth luminous white core pulse
    const glow = ctx.createRadialGradient(px, py, 0, px, py, lineW * 3.1);
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    glow.addColorStop(0.42, 'rgba(255, 255, 255, 0.45)');
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, lineW * 3.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(px, py, Math.max(1.8, lineW * 0.65), 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp beveled static arrowhead at end (no shaking!)
  if (opts.arrowEnd) {
    const prev = samples[Math.max(0, samples.length - 3)];
    const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
    drawStaticArrowhead(ctx, last.x, last.y, angle, opts.colorEnd, lineW * 2.7);
  }

  ctx.restore();
}

function samplePolyline(pts: Pt[], steps: number): Pt[] {
  if (pts.length === 2) {
    const out: Pt[] = [];
    for (let i = 0; i <= steps; i++) {
      const k = i / steps;
      out.push({
        x: pts[0].x + (pts[1].x - pts[0].x) * k,
        y: pts[0].y + (pts[1].y - pts[0].y) * k,
      });
    }
    return out;
  }
  if (pts.length === 3) {
    const out: Pt[] = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const iu = 1 - u;
      out.push({
        x: iu * iu * pts[0].x + 2 * iu * u * pts[1].x + u * u * pts[2].x,
        y: iu * iu * pts[0].y + 2 * iu * u * pts[1].y + u * u * pts[2].y,
      });
    }
    return out;
  }
  return pts;
}

export function drawStaticArrowhead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  color: string,
  size = 8.5,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size * 1.15, -size * 0.56);
  ctx.lineTo(-size * 0.78, 0);
  ctx.lineTo(-size * 1.15, size * 0.56);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(7, 15, 29, 0.65)';
  ctx.lineWidth = 1.1;
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

export interface SprayStreamOpts {
  colorCore: string;
  colorMist: string;
  spreadPx?: number;
  count?: number;
  speed?: number;
}

/**
 * Draws a steady, deterministic particle spray or irrigation stream from origin -> target
 * (for liquid nitrogen mist, saline irrigation, or decompression drainage).
 */
export function drawSprayStream(
  ctx: CanvasRenderingContext2D,
  origin: Pt,
  target: Pt,
  t: number,
  opts: SprayStreamOpts,
): void {
  const dx = target.x - origin.x;
  const dy = target.y - origin.y;
  const len = Math.hypot(dx, dy);
  if (len < 4) return;
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const spread = opts.spreadPx ?? 14;
  const count = opts.count ?? 14;
  const speed = opts.speed ?? 0.65;

  ctx.save();

  // Subtle translucent cone envelope
  const coneGrad = ctx.createLinearGradient(origin.x, origin.y, target.x, target.y);
  coneGrad.addColorStop(0, opts.colorCore);
  coneGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x + nx * spread, target.y + ny * spread);
  ctx.lineTo(target.x - nx * spread, target.y - ny * spread);
  ctx.closePath();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = coneGrad;
  ctx.fill();

  // Smooth deterministic stream droplets along cone
  for (let i = 0; i < count; i++) {
    const lane = ((i % 5) - 2) / 2.2; // -0.91 .. +0.91 fixed lanes
    const phase = (t * speed + i / count) % 1;
    const px = origin.x + dx * phase + nx * lane * spread * phase;
    const py = origin.y + dy * phase + ny * lane * spread * phase;
    const r = (1.6 + (1 - phase) * 1.4);
    ctx.globalAlpha = Math.sin(phase * Math.PI) * 0.85;
    ctx.fillStyle = phase < 0.45 ? opts.colorCore : opts.colorMist;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export interface ShockRingsOpts {
  color: string;
  maxRadius: number;
  rings?: number;
  speed?: number;
  lineWidth?: number;
}

/**
 * Draws smooth concentric expansion/pulse rings without sudden popping.
 */
export function drawShockRings(
  ctx: CanvasRenderingContext2D,
  center: Pt,
  t: number,
  opts: ShockRingsOpts,
): void {
  const rings = opts.rings ?? 3;
  const speed = opts.speed ?? 0.28;
  const baseW = opts.lineWidth ?? 1.8;

  ctx.save();
  for (let i = 0; i < rings; i++) {
    const ph = (t * speed + i / rings) % 1;
    const r = 4 + ph * opts.maxRadius;
    const alpha = Math.pow(1 - ph, 1.35) * 0.72;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = opts.color;
    ctx.lineWidth = baseW * (1 - ph * 0.4);
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export interface OrbitPathOpts {
  color: string;
  speed?: number;
  dashed?: boolean;
  angleOffset?: number;
  lineWidth?: number;
  reverse?: boolean;
}

/**
 * Draws a steady circular/elliptical surgical path with a smooth orbiting tracer dot.
 */
export function drawOrbitPath(
  ctx: CanvasRenderingContext2D,
  center: Pt,
  rx: number,
  ry: number,
  t: number,
  opts: OrbitPathOpts,
): void {
  ctx.save();
  ctx.translate(center.x, center.y);
  if (opts.angleOffset) ctx.rotate(opts.angleOffset);

  // Subtle dark contrast ring
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(7, 15, 29, 0.5)';
  ctx.lineWidth = (opts.lineWidth ?? 2.2) + 1.8;
  if (opts.dashed) ctx.setLineDash([5, 4]);
  ctx.stroke();

  // Main ring
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = opts.lineWidth ?? 2.2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Smoothly orbiting indicator bead
  const dir = opts.reverse ? -1 : 1;
  const theta = dir * t * (opts.speed ?? 1.15);
  const bx = Math.cos(theta) * rx;
  const by = Math.sin(theta) * ry;

  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bx, by, 3.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export interface MeasureBandOpts {
  label: string;
  color: string;
  tickSize?: number;
}

/**
 * Draws a rock-steady clinical measurement line & crisp tag (never vibrates or shakes).
 */
export function drawMeasureBand(
  ctx: CanvasRenderingContext2D,
  a: Pt,
  b: Pt,
  opts: MeasureBandOpts,
): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
  const nx = -dy / len;
  const ny = dx / len;
  const tick = opts.tickSize ?? 5;

  ctx.save();
  ctx.lineCap = 'round';

  // Contrast backing
  ctx.strokeStyle = 'rgba(7, 15, 29, 0.72)';
  ctx.lineWidth = 3.8;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();

  // Foreground line & end ticks
  ctx.strokeStyle = opts.color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.moveTo(a.x - nx * tick, a.y - ny * tick);
  ctx.lineTo(a.x + nx * tick, a.y + ny * tick);
  ctx.moveTo(b.x - nx * tick, b.y - ny * tick);
  ctx.lineTo(b.x + nx * tick, b.y + ny * tick);
  ctx.stroke();

  // Crisp compact measurement pill badge
  const mx = (a.x + b.x) * 0.5;
  const my = (a.y + b.y) * 0.5 - 12;
  drawSteadyBadge(ctx, mx, my, opts.label, opts.color);

  ctx.restore();
}

/**
 * Draws a steady reference angle arc & degree badge (never shakes).
 */
export function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  vertex: Pt,
  radius: number,
  startRad: number,
  endRad: number,
  label: string,
  color: string,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(7, 15, 29, 0.65)';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(vertex.x, vertex.y);
  ctx.lineTo(vertex.x + Math.cos(startRad) * radius * 1.15, vertex.y + Math.sin(startRad) * radius * 1.15);
  ctx.moveTo(vertex.x, vertex.y);
  ctx.lineTo(vertex.x + Math.cos(endRad) * radius * 1.15, vertex.y + Math.sin(endRad) * radius * 1.15);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(vertex.x, vertex.y);
  ctx.lineTo(vertex.x + Math.cos(startRad) * radius * 1.15, vertex.y + Math.sin(startRad) * radius * 1.15);
  ctx.moveTo(vertex.x, vertex.y);
  ctx.lineTo(vertex.x + Math.cos(endRad) * radius * 1.15, vertex.y + Math.sin(endRad) * radius * 1.15);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(vertex.x, vertex.y, radius, startRad, endRad, endRad < startRad);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.1;
  ctx.stroke();

  const midRad = (startRad + endRad) * 0.5;
  drawSteadyBadge(
    ctx,
    vertex.x + Math.cos(midRad) * (radius + 14),
    vertex.y + Math.sin(midRad) * (radius + 14),
    label,
    color,
  );
  ctx.restore();
}

export function drawSteadyBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  accentColor: string,
): void {
  ctx.save();
  ctx.font = '700 10.5px "IBM Plex Mono", monospace';
  const metrics = ctx.measureText(text);
  const padX = 6;
  const bw = metrics.width + padX * 2;
  const bh = 18;
  const bx = x - bw * 0.5;
  const by = y - bh * 0.5;

  ctx.fillStyle = 'rgba(7, 15, 29, 0.88)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, bx, by, bw, bh, 5);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
