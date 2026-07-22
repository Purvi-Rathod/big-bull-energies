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
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts]);

  return {
    textRef,
    currentText: texts[currentIndex] || texts[0],
    isVisible,
  };
};

interface MorphingTextProps {
  className?: string;
  texts: string[];
  style?: React.CSSProperties;
  /** Render as inline span instead of full-width block */
  inline?: boolean;
}

const MorphingText: React.FC<MorphingTextProps> = ({
  texts,
  className,
  style,
  inline = false,
}) => {
  const { textRef, currentText, isVisible } = useMorphingText(texts);

  const content = (
    <span
      ref={textRef}
      className={inline ? className : undefined}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.4s ease-in-out, transform 0.4s ease-in-out",
        display: "inline-block",
      }}
    >
      {currentText}
    </span>
  );

  if (inline) return content;

  return (
    <div
      className={cn(
        "relative w-full text-left font-sans font-bold leading-none",
        className,
      )}
      style={style}
    >
      {content}
    </div>
  );
};

export { MorphingText };
