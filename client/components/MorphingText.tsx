"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const useMorphingText = (texts: string[]) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!texts || texts.length === 0) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % texts.length);
        setIsVisible(true);
      }, 300); // Fade out, then change text, then fade in
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(interval);
  }, [texts]);

  return { textRef, currentText: texts[currentIndex] || texts[0], isVisible };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
  style?: React.CSSProperties;
}

const Texts: React.FC<Pick<MorphingTextProps, "texts"> & { style?: React.CSSProperties }> = ({ texts, style }) => {
  const { textRef, currentText, isVisible } = useMorphingText(texts);
  return (
    <span
      ref={textRef}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
        display: "inline-block",
      }}
    >
      {currentText}
    </span>
  );
};

const MorphingText: React.FC<MorphingTextProps> = ({ texts, className, style }) => {
  return (
    <div
      className={cn(
        "relative w-full text-left font-sans font-bold leading-none",
        className,
      )}
      style={style}
    >
      <Texts texts={texts} style={style} />
    </div>
  );
};

export { MorphingText };

