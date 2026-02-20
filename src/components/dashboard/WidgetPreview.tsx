"use client";

import { useEffect, useRef } from "react";

export function WidgetPreview({
  src,
  coachId,
  mode = "inline",
}: {
  src: string;
  coachId: string;
  mode?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement("script");
    script.src = src;
    script.setAttribute("data-coach-id", coachId);
    if (mode) script.setAttribute("data-mode", mode);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [src, coachId, mode]);

  return <div ref={containerRef} className="mb-8" />;
}
