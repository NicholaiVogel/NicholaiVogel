import React, { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;

    if (!dot || !outline) return;

    // Respect user preferences
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduceMotion) return;

    // rAF-driven cursor animation (single loop, no per-event Web Animations allocations)
    let targetX = 0;
    let targetY = 0;
    let dotX = 0;
    let dotY = 0;
    let outlineX = 0;
    let outlineY = 0;

    let hasInit = false;
    let rafId: number | null = null;
    let lastMoveTs = performance.now();

    const DOT_LERP = 0.65;      // tighter = closer to 1
    const OUTLINE_LERP = 0.18;  // tighter = closer to 1
    const STOP_AFTER_MS = 140;
    const STOP_EPS_PX = 0.35;

    const applyTransforms = () => {
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      outline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
    };

    const tick = (ts: number) => {
      // Lerp towards the target
      dotX += (targetX - dotX) * DOT_LERP;
      dotY += (targetY - dotY) * DOT_LERP;
      outlineX += (targetX - outlineX) * OUTLINE_LERP;
      outlineY += (targetY - outlineY) * OUTLINE_LERP;

      applyTransforms();

      const idle = ts - lastMoveTs > STOP_AFTER_MS;
      const dx = Math.abs(targetX - outlineX);
      const dy = Math.abs(targetY - outlineY);
      const settled = dx < STOP_EPS_PX && dy < STOP_EPS_PX;

      if (idle && settled) {
        rafId = null;
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      lastMoveTs = performance.now();

      if (!hasInit) {
        hasInit = true;
        dotX = targetX;
        dotY = targetY;
        outlineX = targetX;
        outlineY = targetY;
        applyTransforms();
      }

      if (rafId === null) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot hidden md:block"></div>
      <div ref={outlineRef} className="cursor-outline hidden md:block"></div>
    </>
  );
};

export default CustomCursor;
