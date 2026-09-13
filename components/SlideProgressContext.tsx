"use client";

import { createContext, useContext, useMemo, useState } from "react";

export const AUTOPLAY_MS = 10000;

type SlideProgressContextValue = {
  progress: number;
  setProgress: (value: number) => void;
  enabled: boolean;
  setEnabled: (value: boolean) => void;
  slideIndex: number;
  setSlideIndex: (value: number) => void;
};

const SlideProgressContext = createContext<SlideProgressContextValue | null>(null);

export function SlideProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const value = useMemo(
    () => ({ progress, setProgress, enabled, setEnabled, slideIndex, setSlideIndex }),
    [progress, enabled, slideIndex]
  );

  return (
    <SlideProgressContext.Provider value={value}>{children}</SlideProgressContext.Provider>
  );
}

export function useSlideProgress() {
  const ctx = useContext(SlideProgressContext);
  if (!ctx) {
    throw new Error("useSlideProgress must be used within SlideProgressProvider");
  }
  return ctx;
}
