import React, {useEffect, useRef, useState} from 'react';
import type {StudioRuntimeState, TopicItem, TopicStudioSpec} from '../types/academy';
import {STUDIO_SPECS} from '../data/studioSpecs';

interface MediaStudioProps {
  topic: TopicItem;
}

interface PinRuntime {
  key: string;
  el: HTMLButtonElement;
  shadowPathEl: SVGPathElement;
  pathEl: SVGPathElement;
  arrowEl: SVGPolygonElement;
  ringEl: SVGCircleElement;
  dotEl: SVGCircleElement;
  pw: number;
  ph: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
  side: 'left' | 'right';
  inFrame: boolean;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function getCoverRect(
  viewW: number,
  viewH: number,
  natW: number,
  natH: number,
): {offX: number; offY: number; drawW: number; drawH: number} {
  if (!natW || !natH || !viewW || !viewH) {
    return {offX: 0, offY: 0, drawW: viewW, drawH: viewH};
  }
  const imgAspect = natW / natH;
  const viewAspect = viewW / viewH;
  let drawW = viewW;
  let drawH = viewH;
  let offX = 0;
  let offY = 0;
  if (viewAspect > imgAspect) {
    drawW = viewW;
    drawH = viewW / imgAspect;
    offY = (viewH - drawH) * 0.5;
  } else {
    drawH = viewH;
    drawW = viewH * imgAspect;
    offX = (viewW - drawW) * 0.5;
  }
  return {offX, offY, drawW, drawH};
}

function mapNormToCoverBase(
  nx: number,
  ny: number,
  viewW: number,
  viewH: number,
  natW: number,
  natH: number,
): {x: number; y: number} {
  const {offX, offY, drawW, drawH} = getCoverRect(viewW, viewH, natW, natH);
  return {
    x: offX + nx * drawW,
    y: offY + ny * drawH,
  };
}

export const MediaStudio: React.FC<MediaStudioProps> = ({topic}) => {
  const spec: TopicStudioSpec | undefined = STUDIO_SPECS[topic.id];
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // Synced React UI state for controls & cards
  const [scIdx, setScIdx] = useState(0);
  const [activePart, setActivePart] = useState<string>(
    spec?.scenarios[0]?.activePart || spec?.parts[0]?.key || '',
  );
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1);
  const [showLabels, setShowLabels] = useState(true);
  const [zoomVal, setZoomVal] = useState<number>(spec?.scenarios[0]?.focus.scale ?? 1);
  const [timeVal, setTimeVal] = useState(0);

  // Mutable ref bridge for the 60fps imperative mountMediaStudio engine
  const ctrlRef = useRef<{
    selectScenario: (idx: number) => void;
    selectPart: (key: string) => void;
    setPlaying: (p: boolean) => void;
    restart: () => void;
    seekBy: (delta: number) => void;
    seekTo: (val: number) => void;
    setSpeed: (s: number) => void;
    adjustZoom: (delta: number) => void;
    resetView: () => void;
    setShowLabels: (show: boolean) => void;
  } | null>(null);

  useEffect(() => {
    setImgFailed(false);
    setScIdx(0);
    setPlaying(true);
    setSpeed(1);
    setShowLabels(true);
    setTimeVal(0);
    if (spec) {
      setActivePart(spec.scenarios[0]?.activePart || spec.parts[0]?.key || '');
      setZoomVal(spec.scenarios[0]?.focus.scale ?? 1);
    }
  }, [topic.id, spec]);

  useEffect(() => {
    const rawViewport = stageRef.current;
    if (!rawViewport || !spec) return;
    const activeSpec = spec;
    const hostViewport = rawViewport;

    const rawWorld = hostViewport.querySelector<HTMLDivElement>('[data-studio-world]');
    const imgEl = hostViewport.querySelector<HTMLImageElement>('[data-studio-img]');
    const rawCanvas = hostViewport.querySelector<HTMLCanvasElement>('[data-studio-canvas]');
    const rawSvg = hostViewport.querySelector<SVGSVGElement>('[data-studio-leaders]');
    const rawPins = hostViewport.querySelector<HTMLDivElement>('[data-studio-pins]');
    if (!rawWorld || !rawCanvas || !rawSvg || !rawPins) return;
    const worldEl = rawWorld;
    const canvasEl = rawCanvas;
    const svgEl = rawSvg;
    const pinsHost = rawPins;

    const rawCtx = canvasEl.getContext('2d');
    if (!rawCtx) return;
    const ctx = rawCtx;

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const st: StudioRuntimeState = {
      scIdx: 0,
      time: 0,
      duration: activeSpec.scenarios[0]?.duration ?? activeSpec.duration ?? 8,
      playing: !reducedMotion,
      speed: 1,
      activePart: activeSpec.scenarios[0]?.activePart || activeSpec.parts[0]?.key || '',
      showLabels: true,
      zoom: activeSpec.scenarios[0]?.focus.scale ?? 1,
      panX: 0,
      panY: 0,
    };

    const initFocus = activeSpec.scenarios[0]?.focus || {cx: 0.5, cy: 0.5, scale: 1};
    const camCur = {cx: initFocus.cx, cy: initFocus.cy, scale: initFocus.scale, panX: 0, panY: 0};
    const camTgt = {cx: initFocus.cx, cy: initFocus.cy, scale: initFocus.scale, panX: 0, panY: 0};

    let viewW = hostViewport.clientWidth || 720;
    let viewH = hostViewport.clientHeight || 405;
    let alive = true;
    let isOnScreen = true;
    let rafId = 0;
    let lastNow = 0;
    let uiSyncAccum = 0;

    // Build Layer 4 pin elements + SVG cubic bezier leaders + small target dots
    svgEl.innerHTML = '';
    pinsHost.innerHTML = '';

    const pinRuntimes: PinRuntime[] = activeSpec.parts.map((part, idx) => {
      const shadowPathEl = document.createElementNS(SVG_NS, 'path');
      shadowPathEl.setAttribute('fill', 'none');
      shadowPathEl.setAttribute('stroke', 'rgba(5, 11, 20, 0.72)');
      shadowPathEl.setAttribute('stroke-width', '3.3');
      shadowPathEl.setAttribute('stroke-linecap', 'round');

      const pathEl = document.createElementNS(SVG_NS, 'path');
      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('stroke', '#14B8A6');
      pathEl.setAttribute('stroke-width', '1.85');
      pathEl.setAttribute('stroke-linecap', 'round');

      const arrowEl = document.createElementNS(SVG_NS, 'polygon');
      arrowEl.setAttribute('fill', '#14B8A6');
      arrowEl.setAttribute('stroke', 'rgba(5, 11, 20, 0.72)');
      arrowEl.setAttribute('stroke-width', '0.9');

      // Small crisp target ring (r = 5.8px) + solid inner center dot (r = 3.0px), zero large halos
      const ringEl = document.createElementNS(SVG_NS, 'circle');
      ringEl.setAttribute('r', '5.8');
      ringEl.setAttribute('fill', 'none');
      ringEl.setAttribute('stroke', '#F8FAFC');
      ringEl.setAttribute('stroke-width', '1.45');

      const dotEl = document.createElementNS(SVG_NS, 'circle');
      dotEl.setAttribute('r', '3.0');
      dotEl.setAttribute('fill', '#14B8A6');
      dotEl.setAttribute('stroke', 'rgba(5, 11, 20, 0.85)');
      dotEl.setAttribute('stroke-width', '1.1');

      svgEl.appendChild(shadowPathEl);
      svgEl.appendChild(pathEl);
      svgEl.appendChild(arrowEl);
      svgEl.appendChild(ringEl);
      svgEl.appendChild(dotEl);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sim-3d-pin' + (part.key === st.activePart ? ' active' : '');
      btn.setAttribute('data-pin-key', part.key);

      const idxSpan = document.createElement('span');
      idxSpan.className = 'sim-3d-pin-idx';
      idxSpan.textContent = String(idx + 1);

      const lblSpan = document.createElement('span');
      lblSpan.textContent = part.ar;

      btn.appendChild(idxSpan);
      btn.appendChild(lblSpan);
      pinsHost.appendChild(btn);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectPart(part.key);
      });

      return {
        key: part.key,
        el: btn,
        shadowPathEl,
        pathEl,
        arrowEl,
        ringEl,
        dotEl,
        pw: 120,
        ph: 28,
        ax: viewW * 0.5,
        ay: viewH * 0.5,
        bx: 12,
        by: 12,
        side: 'left',
        inFrame: true,
      };
    });

    function measurePins() {
      pinRuntimes.forEach((pr) => {
        const rect = pr.el.getBoundingClientRect();
        if (rect.width > 12) pr.pw = rect.width;
        if (rect.height > 10) pr.ph = rect.height;
      });
    }

    function syncCanvasSize() {
      viewW = Math.max(260, hostViewport.clientWidth);
      viewH = Math.max(180, hostViewport.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasEl.width = Math.round(viewW * dpr);
      canvasEl.height = Math.round(viewH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      svgEl.setAttribute('viewBox', `0 0 ${viewW} ${viewH}`);
      measurePins();
    }

    function computeWorldTransform() {
      const S = camCur.scale;
      const natW = imgEl?.naturalWidth || 16;
      const natH = imgEl?.naturalHeight || 9;
      const focusBase = mapNormToCoverBase(camCur.cx, camCur.cy, viewW, viewH, natW, natH);
      let tx = viewW * 0.5 - focusBase.x * S + camCur.panX;
      let ty = viewH * 0.5 - focusBase.y * S + camCur.panY;
      if (S >= 1) {
        const minTx = viewW - viewW * S;
        const minTy = viewH - viewH * S;
        tx = clamp(tx, minTx, 0);
        ty = clamp(ty, minTy, 0);
      } else {
        tx = (viewW - viewW * S) * 0.5;
        ty = (viewH - viewH * S) * 0.5;
      }
      return {tx, ty, scale: S};
    }

    function layoutPinsAndLeaders(tx: number, ty: number, scale: number) {
      const vis = st.showLabels;
      svgEl.style.opacity = vis ? '1' : '0';
      pinsHost.style.opacity = vis ? '1' : '0';
      pinsHost.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;

      const natW = imgEl?.naturalWidth || 16;
      const natH = imgEl?.naturalHeight || 9;

      // 1. Project every anatomical target point into exact viewport screen coordinates
      for (let i = 0; i < pinRuntimes.length; i++) {
        const pr = pinRuntimes[i];
        const part = activeSpec.parts[i];
        const norm = part.getPosPct ? part.getPosPct(st.time, st) : part.posPct;
        const base = mapNormToCoverBase(norm[0], norm[1], viewW, viewH, natW, natH);
        const rawAx = base.x * scale + tx;
        const rawAy = base.y * scale + ty;
        pr.inFrame = rawAx >= 6 && rawAx <= viewW - 6 && rawAy >= 6 && rawAy <= viewH - 6;
        pr.ax = clamp(rawAx, 10, viewW - 10);
        pr.ay = clamp(rawAy, 12, viewH - 12);
        pr.side = pr.ax < viewW * 0.5 ? 'left' : 'right';

        const isActive = pr.key === st.activePart;
        pr.el.classList.toggle('active', isActive);
        const col = isActive ? '#F3D186' : '#14B8A6';
        pr.pathEl.setAttribute('stroke', col);
        pr.arrowEl.setAttribute('fill', col);
        pr.dotEl.setAttribute('fill', isActive ? '#F3D186' : '#14B8A6');
        pr.ringEl.setAttribute('stroke', isActive ? '#F3D186' : '#F8FAFC');
      }

      // 2. Partition strictly into Left & Right side edge columns (padX = 10)
      const padX = 10;
      const topPad = 12;
      const bottomPad = 12;
      const minGap = 7;

      const leftCols = pinRuntimes
        .filter((p) => p.side === 'left')
        .sort((a, b) => a.ay - b.ay);
      const rightCols = pinRuntimes
        .filter((p) => p.side === 'right')
        .sort((a, b) => a.ay - b.ay);

      const stackColumn = (col: PinRuntime[], isLeft: boolean) => {
        if (!col.length) return;
        for (let i = 0; i < col.length; i++) {
          const item = col[i];
          item.bx = isLeft ? padX : viewW - padX - item.pw;
          item.by = clamp(item.ay - item.ph * 0.5, topPad, viewH - bottomPad - item.ph);
        }
        // Forward overlap push down
        for (let i = 1; i < col.length; i++) {
          const prev = col[i - 1];
          const curr = col[i];
          const minY = prev.by + prev.ph + minGap;
          if (curr.by < minY) curr.by = minY;
        }
        // Backward overflow push up if exceeding bottom margin
        const last = col[col.length - 1];
        const maxBottom = viewH - bottomPad;
        if (last.by + last.ph > maxBottom) {
          last.by = maxBottom - last.ph;
          for (let i = col.length - 2; i >= 0; i--) {
            const curr = col[i];
            const next = col[i + 1];
            const maxAllowed = next.by - minGap - curr.ph;
            if (curr.by > maxAllowed) curr.by = maxAllowed;
          }
        }
        // Final top clamp
        if (col[0].by < topPad) col[0].by = topPad;

        // Enforce >= 32px clearance between inner pin edge and its target dot if possible
        for (let i = 0; i < col.length; i++) {
          const item = col[i];
          const edgeX = isLeft ? item.bx + item.pw : item.bx;
          const horizClear = isLeft ? item.ax - edgeX : edgeX - item.ax;
          const vertDist = Math.abs(item.ay - (item.by + item.ph * 0.5));
          const euclid = Math.hypot(Math.max(0, -horizClear), vertDist);
          if (horizClear < 32 && euclid < 32) {
            const shiftUp = item.ay - item.ph - 34;
            const shiftDn = item.ay + 34;
            if (shiftUp >= topPad) item.by = shiftUp;
            else if (shiftDn + item.ph <= maxBottom) item.by = shiftDn;
          }
        }
      };

      stackColumn(leftCols, true);
      stackColumn(rightCols, false);

      // 3. Apply transforms + smooth Cubic Bezier leaders + beveled arrowhead
      for (let i = 0; i < pinRuntimes.length; i++) {
        const pr = pinRuntimes[i];
        pr.el.style.transform = `translate3d(${pr.bx.toFixed(1)}px, ${pr.by.toFixed(1)}px, 0)`;

        const isLeft = pr.side === 'left';
        const sx = isLeft ? pr.bx + pr.pw : pr.bx;
        const sy = pr.by + pr.ph * 0.5;
        const dx = pr.ax - sx;
        const dy = pr.ay - sy;
        const dist = Math.hypot(dx, dy);

        pr.ringEl.setAttribute('cx', pr.ax.toFixed(1));
        pr.ringEl.setAttribute('cy', pr.ay.toFixed(1));
        pr.dotEl.setAttribute('cx', pr.ax.toFixed(1));
        pr.dotEl.setAttribute('cy', pr.ay.toFixed(1));

        const isActive = pr.key === st.activePart;
        if (!pr.inFrame) {
          pr.el.style.opacity = isActive ? '0.88' : '0.48';
          pr.ringEl.style.opacity = '0';
          pr.dotEl.style.opacity = '0';
          pr.shadowPathEl.style.opacity = '0';
          pr.pathEl.style.opacity = '0';
          pr.arrowEl.style.opacity = '0';
          continue;
        }

        pr.el.style.opacity = '1';
        pr.ringEl.style.opacity = '1';
        pr.dotEl.style.opacity = '1';

        if (dist < 16) {
          pr.shadowPathEl.style.opacity = '0';
          pr.pathEl.style.opacity = '0';
          pr.arrowEl.style.opacity = '0';
          continue;
        }

        const stopGap = 7.5;
        const bend = clamp(Math.abs(dx) * 0.45, 22, 85);
        const dir = isLeft ? 1 : -1;
        const c1x = sx + dir * bend;
        const c1y = sy;
        const endAngle = Math.atan2(dy, dx - dir * bend * 0.25);
        const tipX = pr.ax - Math.cos(endAngle) * stopGap;
        const tipY = pr.ay - Math.sin(endAngle) * stopGap;
        const c2x = tipX - Math.cos(endAngle) * (bend * 0.52);
        const c2y = tipY - Math.sin(endAngle) * (bend * 0.52);

        const dStr = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(
          1,
        )}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${tipX.toFixed(1)} ${tipY.toFixed(1)}`;
        pr.shadowPathEl.setAttribute('d', dStr);
        pr.pathEl.setAttribute('d', dStr);
        pr.shadowPathEl.style.opacity = '1';
        pr.pathEl.style.opacity = '1';

        // Crisp beveled arrowhead pointing accurately toward target dot center
        const tangentAngle = Math.atan2(tipY - c2y, tipX - c2x);
        const aLen = 7.6;
        const aWid = 3.4;
        const cosA = Math.cos(tangentAngle);
        const sinA = Math.sin(tangentAngle);
        const bx1 = tipX - cosA * aLen - sinA * aWid;
        const by1 = tipY - sinA * aLen + cosA * aWid;
        const bxMid = tipX - cosA * (aLen * 0.68);
        const byMid = tipY - sinA * (aLen * 0.68);
        const bx2 = tipX - cosA * aLen + sinA * aWid;
        const by2 = tipY - sinA * aLen - cosA * aWid;

        pr.arrowEl.setAttribute(
          'points',
          `${tipX.toFixed(1)},${tipY.toFixed(1)} ${bx1.toFixed(1)},${by1.toFixed(
            1,
          )} ${bxMid.toFixed(1)},${byMid.toFixed(1)} ${bx2.toFixed(1)},${by2.toFixed(1)}`,
        );
        pr.arrowEl.style.opacity = '1';
      }
    }

    function drawCurrentFrame(dt: number) {
      if (st.playing && !reducedMotion) {
        st.time += dt * st.speed;
        if (st.time >= st.duration) {
          st.time = st.time % st.duration;
        }
      }

      // Smooth 60fps camera focus interpolation (no jumps)
      const ease = 1 - Math.exp(-8.5 * Math.max(0.008, dt));
      camCur.cx += (camTgt.cx - camCur.cx) * ease;
      camCur.cy += (camTgt.cy - camCur.cy) * ease;
      camCur.scale += (camTgt.scale - camCur.scale) * ease;
      camCur.panX += (camTgt.panX - camCur.panX) * ease;
      camCur.panY += (camTgt.panY - camCur.panY) * ease;

      const {tx, ty, scale} = computeWorldTransform();
      worldEl.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(
        2,
      )}px, 0) scale(${scale.toFixed(4)})`;

      // Layer 3 Canvas overlay locked 1:1 to exact cover-fitted image rectangle
      ctx.clearRect(0, 0, viewW, viewH);
      const natW = imgEl?.naturalWidth || 16;
      const natH = imgEl?.naturalHeight || 9;
      const cover = getCoverRect(viewW, viewH, natW, natH);
      ctx.save();
      ctx.translate(cover.offX, cover.offY);
      activeSpec.drawOverlay(ctx, cover.drawW, cover.drawH, st.time, st);
      ctx.restore();

      // Layer 4 Edge pins + Curved Bezier SVG leaders
      layoutPinsAndLeaders(tx, ty, scale);

      uiSyncAccum += dt;
      if (uiSyncAccum >= 0.08) {
        uiSyncAccum = 0;
        setTimeVal(st.time);
      }
    }

    function tick(now: number) {
      if (!alive) return;
      rafId = 0;
      if (!isOnScreen || document.hidden) return;
      const dt = lastNow ? Math.min(0.05, (now - lastNow) * 0.001) : 0.016;
      lastNow = now;
      drawCurrentFrame(dt);
      rafId = requestAnimationFrame(tick);
    }

    function ensureLoop() {
      if (!alive || !isOnScreen || document.hidden) return;
      if (!rafId) {
        lastNow = 0;
        rafId = requestAnimationFrame(tick);
      }
    }

    function selectScenario(idx: number) {
      const nextIdx = clamp(idx, 0, activeSpec.scenarios.length - 1);
      const sc = activeSpec.scenarios[nextIdx];
      st.scIdx = nextIdx;
      st.duration = sc.duration ?? activeSpec.duration ?? 8;
      st.time = 0;
      st.activePart = sc.activePart || activeSpec.parts[0]?.key || '';
      camTgt.cx = sc.focus.cx;
      camTgt.cy = sc.focus.cy;
      camTgt.scale = sc.focus.scale;
      camTgt.panX = 0;
      camTgt.panY = 0;
      st.zoom = sc.focus.scale;
      setScIdx(nextIdx);
      setActivePart(st.activePart);
      setZoomVal(sc.focus.scale);
      setTimeVal(0);
    }

    function selectPart(key: string) {
      st.activePart = key;
      setActivePart(key);
      const idx = activeSpec.parts.findIndex((p) => p.key === key);
      if (idx >= 0) {
        const part = activeSpec.parts[idx];
        const norm = part.getPosPct ? part.getPosPct(st.time, st) : part.posPct;
        const pr = pinRuntimes[idx];
        const nearEdge =
          pr &&
          (!pr.inFrame ||
            pr.ax < 28 ||
            pr.ax > viewW - 28 ||
            pr.ay < 24 ||
            pr.ay > viewH - 24);
        if (nearEdge) {
          camTgt.cx = norm[0];
          camTgt.cy = norm[1];
          camTgt.panX = 0;
          camTgt.panY = 0;
        }
      }
    }

    function setPlayingState(p: boolean) {
      st.playing = p;
      setPlaying(p);
    }

    function restart() {
      st.time = 0;
      st.playing = true;
      setPlaying(true);
      setTimeVal(0);
    }

    function seekBy(delta: number) {
      let next = st.time + delta;
      if (next < 0) next = st.duration + (next % st.duration);
      if (next >= st.duration) next = next % st.duration;
      st.time = next;
      setTimeVal(next);
    }

    function seekTo(val: number) {
      st.time = clamp(val, 0, st.duration);
      setTimeVal(st.time);
    }

    function setSpeedVal(s: number) {
      st.speed = s;
      setSpeed(s);
    }

    function adjustZoom(delta: number) {
      const next = clamp(Number((camTgt.scale + delta).toFixed(2)), 1.0, 2.5);
      camTgt.scale = next;
      if (next <= 1.01) {
        camTgt.cx = 0.5;
        camTgt.cy = 0.5;
        camTgt.panX = 0;
        camTgt.panY = 0;
      }
      st.zoom = next;
      setZoomVal(next);
    }

    function resetView() {
      const sc = activeSpec.scenarios[st.scIdx];
      camTgt.cx = sc?.focus.cx ?? 0.5;
      camTgt.cy = sc?.focus.cy ?? 0.5;
      camTgt.scale = sc?.focus.scale ?? 1;
      camTgt.panX = 0;
      camTgt.panY = 0;
      st.zoom = camTgt.scale;
      setZoomVal(camTgt.scale);
    }

    function setLabelsVisible(show: boolean) {
      st.showLabels = show;
      setShowLabels(show);
    }

    ctrlRef.current = {
      selectScenario,
      selectPart,
      setPlaying: setPlayingState,
      restart,
      seekBy,
      seekTo,
      setSpeed: setSpeedVal,
      adjustZoom,
      resetView,
      setShowLabels: setLabelsVisible,
    };

    // Pointer drag panning when zoomed in + wheel zoom
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let basePanX = 0;
    let basePanY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest('.sim-3d-pin')) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      basePanX = camTgt.panX;
      basePanY = camTgt.panY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const maxPanX = Math.max(0, (viewW * (camTgt.scale - 1)) * 0.65);
      const maxPanY = Math.max(0, (viewH * (camTgt.scale - 1)) * 0.65);
      camTgt.panX = clamp(basePanX + (e.clientX - dragStartX), -maxPanX, maxPanX);
      camTgt.panY = clamp(basePanY + (e.clientY - dragStartY), -maxPanY, maxPanY);
    };
    const onPointerUp = () => {
      dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) > 0) {
        if (camTgt.scale > 1.01 || e.deltaY < 0) {
          e.preventDefault();
          adjustZoom(e.deltaY < 0 ? 0.14 : -0.14);
        }
      }
    };

    hostViewport.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    hostViewport.addEventListener('wheel', onWheel, {passive: false});

    const onImgLoad = () => {
      syncCanvasSize();
      drawCurrentFrame(0.016);
    };
    if (imgEl) {
      if (imgEl.complete) syncCanvasSize();
      imgEl.addEventListener('load', onImgLoad);
    }

    syncCanvasSize();
    const fontMeasureTimer = window.setTimeout(() => {
      if (alive) {
        syncCanvasSize();
        drawCurrentFrame(0.016);
      }
    }, 140);
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (alive) {
          syncCanvasSize();
          drawCurrentFrame(0.016);
        }
      });
    }

    let resObs: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resObs = new ResizeObserver(() => {
        if (alive) {
          syncCanvasSize();
          drawCurrentFrame(0.016);
        }
      });
      resObs.observe(hostViewport);
    }

    let intObs: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intObs = new IntersectionObserver(
        (entries) => {
          isOnScreen = Boolean(entries[0]?.isIntersecting);
          if (isOnScreen) ensureLoop();
          else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
          }
        },
        {threshold: 0.05},
      );
      intObs.observe(hostViewport);
    }

    const onVisChange = () => {
      if (document.hidden) {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else if (isOnScreen) {
        ensureLoop();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    ensureLoop();

    return () => {
      alive = false;
      ctrlRef.current = null;
      window.clearTimeout(fontMeasureTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (intObs) intObs.disconnect();
      if (resObs) resObs.disconnect();
      if (imgEl) imgEl.removeEventListener('load', onImgLoad);
      document.removeEventListener('visibilitychange', onVisChange);
      hostViewport.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      hostViewport.removeEventListener('wheel', onWheel);
    };
  }, [spec]);

  if (!spec) {
    return null;
  }

  const currentScenario = spec.scenarios[scIdx] || spec.scenarios[0];
  const currentDuration = currentScenario?.duration ?? spec.duration ?? 8;
  const currentPart = spec.parts.find((p) => p.key === activePart) || spec.parts[0];

  return (
    <div className="media-studio-stage">
      {/* Layer 1 + 2 + 3 + 4 Viewport */}
      <div ref={stageRef} className="media-studio-viewport">
        {/* Layer 1 & 3 World transformed smoothly via translate3d() + scale() */}
        <div data-studio-world="" className="media-studio-world">
          {!imgFailed ? (
            <img
              data-studio-img=""
              src={spec.imgSrc}
              alt={spec.imgAlt}
              referrerPolicy="no-referrer"
              className="media-studio-img"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <div className="media-studio-img-fallback">
              <div className="ltr text-sm font-bold">{topic.titleEn}</div>
              <div className="text-xs opacity-80">{topic.titleAr}</div>
            </div>
          )}
          <canvas data-studio-canvas="" className="media-studio-canvas" />
        </div>

        {/* Layer 4 SVG Curved Leader Lines + Crisp Small Target Dots */}
        <svg data-studio-leaders="" className="media-studio-leaders" />

        {/* Layer 4 Edge-Pinned Callout Buttons */}
        <div data-studio-pins="" className="media-studio-pins" />
      </div>

      {/* Interactive Timeline Scrubber */}
      <div className="studio-scrubber-bar">
        <span className="studio-time-readout tabular-nums">
          {timeVal.toFixed(1)}s / {currentDuration.toFixed(1)}s
        </span>
        <input
          type="range"
          min={0}
          max={currentDuration}
          step={0.05}
          value={Math.min(timeVal, currentDuration)}
          onChange={(e) => ctrlRef.current?.seekTo(Number(e.target.value))}
          aria-label="شريط الزمن التفاعلي"
          className="studio-scrubber-range"
        />
        <span className="studio-time-readout tabular-nums">
          {zoomVal.toFixed(2)}x · {speed}x
        </span>
      </div>

      {/* Full Working Controls Dock */}
      <div className="sim-controls-dock">
        <button
          type="button"
          className={`sim-btn ${playing ? 'active' : ''}`}
          onClick={() => ctrlRef.current?.setPlaying(!playing)}
        >
          {playing ? 'إيقاف مؤقت' : 'تشغيل الحركة'}
        </button>
        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.restart()}
        >
          إعادة التشغيل
        </button>
        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.seekBy(-1.5)}
        >
          ترجيع -1.5s
        </button>
        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.seekBy(1.5)}
        >
          تقديم +1.5s
        </button>

        <button
          type="button"
          className={`sim-btn ${speed === 0.5 ? 'active' : ''}`}
          onClick={() => ctrlRef.current?.setSpeed(0.5)}
        >
          بطيئة 0.5x
        </button>
        <button
          type="button"
          className={`sim-btn ${speed === 1 ? 'active' : ''}`}
          onClick={() => ctrlRef.current?.setSpeed(1)}
        >
          سرعة 1x
        </button>
        <button
          type="button"
          className={`sim-btn ${speed === 1.5 ? 'active' : ''}`}
          onClick={() => ctrlRef.current?.setSpeed(1.5)}
        >
          سرعة 1.5x
        </button>

        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.adjustZoom(0.25)}
        >
          تقريب +
        </button>
        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.adjustZoom(-0.25)}
        >
          إبعاد -
        </button>
        <button
          type="button"
          className="sim-btn"
          onClick={() => ctrlRef.current?.resetView()}
        >
          إعادة الكاميرا
        </button>
        <button
          type="button"
          className={`sim-btn ${showLabels ? 'active' : ''}`}
          onClick={() => ctrlRef.current?.setShowLabels(!showLabels)}
        >
          {showLabels ? 'إخفاء التسميات' : 'إظهار التسميات'}
        </button>
      </div>

      {/* Scenarios Switcher */}
      <div className="sim-scenarios-bar">
        {spec.scenarios.map((sc, idx) => (
          <button
            key={sc.label}
            type="button"
            className={`sim-btn ${scIdx === idx ? 'active' : ''}`}
            onClick={() => ctrlRef.current?.selectScenario(idx)}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* 3 Scenario-Specific Iraqi Clinical Explanation Cards */}
      {currentScenario && (
        <div className="sim-iq-guide">
          <div className="sim-iq-guide-head">
            <div className="sim-iq-guide-title">
              الشرح السريري التفاعلي باللهجة العراقية لهذه اللقطة
            </div>
            <div className="sim-iq-guide-badge">{currentScenario.label}</div>
          </div>
          <div className="sim-iq-cards">
            <div className="sim-iq-card">
              <div className="sim-iq-card-lbl">1. شدا تشوف هسه باللقطة؟</div>
              <div className="sim-iq-card-txt">{currentScenario.seeIq}</div>
            </div>
            <div className="sim-iq-card">
              <div className="sim-iq-card-lbl">2. ليش جاي يصير هيج بالعيادة؟</div>
              <div className="sim-iq-card-txt">{currentScenario.whyIq}</div>
            </div>
            <div className="sim-iq-card">
              <div className="sim-iq-card-lbl gold">3. زبدة الامتحان:</div>
              <div className="sim-iq-card-txt">{currentScenario.tipIq}</div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Anatomical Parts Inspector */}
      <div className="sim-inspector">
        <div style={{fontWeight: 800, color: 'var(--navy)', fontSize: '0.88rem'}}>
          اضغط على أي تسمية من الحواف أو من القائمة أدناه لاستعراض التفصيل التشريحي والعلمي:
        </div>
        <div className="sim-part-chips">
          {spec.parts.map((part, idx) => (
            <button
              key={part.key}
              type="button"
              className={`sim-part-chip ${part.key === activePart ? 'selected' : ''}`}
              onClick={() => ctrlRef.current?.selectPart(part.key)}
            >
              {idx + 1}. {part.ar}
            </button>
          ))}
        </div>
        {currentPart && (
          <div className="sim-inspector-grid">
            <div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700}}>
                المصطلح والترجمة
              </div>
              <div className="ltr" style={{fontWeight: 800, color: 'var(--navy)'}}>
                {currentPart.en}
              </div>
              <div style={{fontWeight: 700, color: 'var(--turquoise)'}}>{currentPart.ar}</div>
            </div>
            <div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700}}>
                الشرح التوضيحي بالعراقي
              </div>
              <div>{currentPart.iq}</div>
            </div>
            <div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700}}>
                الأهمية بالعيادة والامتحان
              </div>
              <div className="ltr" style={{fontWeight: 600}}>
                {currentPart.clinical}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
