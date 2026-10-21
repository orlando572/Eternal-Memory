"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const motionQuery = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

function subscribeToMotion(onChange: () => void) {
  const media = window.matchMedia(motionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readMotion() {
  return window.matchMedia(motionQuery).matches;
}

// Keeps only the drawer's visual presence alive during its exit transition.
export function useCartMotion(isOpen: boolean) {
  const animate = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const [exiting, setExiting] = useState(false);

  if (previousOpen !== isOpen) {
    setPreviousOpen(isOpen);
    setExiting(!isOpen && animate);
  }

  useEffect(() => {
    if (!exiting) return;
    // Also cleans up if the browser interrupts or skips transitionend.
    const timer = window.setTimeout(() => setExiting(false), animate ? 240 : 0);
    return () => window.clearTimeout(timer);
  }, [exiting, animate]);

  return {
    present: isOpen || (exiting && animate),
    finishExit: () => { if (!isOpen) setExiting(false); },
  };
}
