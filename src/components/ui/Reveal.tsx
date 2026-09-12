"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, HTMLAttributes, Ref } from "react";
import { cn } from "@/lib/utils";

export interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Stagger children reveals from a shared parent by passing an index. */
  delay?: number;
}

/**
 * The one entrance-animation primitive for the site: fade + rise into view
 * on scroll, via IntersectionObserver. No scroll library — this is the
 * cheapest technique that still reads as "cinematic reveal." Reduced-motion
 * is handled globally by the `.reveal` CSS (see globals.css), not here.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  className,
  style,
  children,
  ...props
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as Ref<HTMLElement>}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      {...props}
    >
      {children}
    </Tag>
  );
}
