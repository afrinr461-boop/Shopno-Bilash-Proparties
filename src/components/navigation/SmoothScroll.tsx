"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Public site only — momentum/inertia scrolling (a short wheel flick keeps
 * gliding and settles with easing, instead of the browser's default
 * scroll-then-instant-stop). Mounted once in the `(public)` layout;
 * Admin/Portal deliberately don't get this (dense data tables and their
 * own internal scroll containers don't want the page itself hijacking the
 * wheel). Renders nothing — a pure side-effect that wires the whole
 * document's scrolling to Lenis for as long as this route group is mounted.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
