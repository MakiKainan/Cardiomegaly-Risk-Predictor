import React, { useState, useEffect } from 'react';
import { useInView } from './Reveal';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  id?: string;
  /** Substring to tint (e.g. "Elderly Patients"). Matched per line. */
  highlight?: string;
  highlightColor?: string;
  /** Run the `.hero-title-cycle` colour animation, replaying it every time
   *  the heading scrolls back into view. */
  colorCycle?: boolean;
}

export default function AnimatedHeading({
  text,
  className = '',
  id,
  highlight,
  highlightColor = '#34D399',
  colorCycle = false,
}: AnimatedHeadingProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  // Toggling the cycle class off (out of view) and on (back in view) restarts
  // the CSS colour animation — same reset-on-scroll behaviour as the sections.
  const { ref, inView } = useInView<HTMLHeadingElement>();
  const lines = text.split('\n');

  useEffect(() => {
    // Initial delay of 200ms before triggering the entrance transitions
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1
      id={id}
      ref={colorCycle ? ref : undefined}
      className={`leading-tight font-normal ${colorCycle && inView ? 'hero-title-cycle' : ''} ${className}`}
    >
      {lines.map((line, lineIndex) => {
        // Calculate lineLength for stagger delay calculations
        const lineLength = line.length;
        // Where the highlighted substring starts on this line (-1 = absent).
        const hiStart = highlight ? line.indexOf(highlight) : -1;
        return (
          <span key={lineIndex} className="block whitespace-pre select-none">
            {line.split('').map((char, charIndex) => {
              // Stagger delay formula as specified: (lineIndex * lineLength * 30ms) + (charIndex * 30ms)
              const staggerDelay = (lineIndex * lineLength * 30) + (charIndex * 30);

              // Handle spaces representation
              const displayChar = char === ' ' ? '\u00A0' : char;

              // Tinted chars get a fixed colour, overriding the title's colour
              // cycle (inline colour wins over the inherited animated colour).
              const inHighlight =
                hiStart >= 0 && charIndex >= hiStart && charIndex < hiStart + (highlight as string).length;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all"
                  style={{
                    opacity: isAnimated ? 1 : 0,
                    transform: isAnimated ? 'translateX(0)' : 'translateX(-18px)',
                    color: inHighlight ? highlightColor : undefined,
                    transitionDuration: '500ms',
                    transitionDelay: `${staggerDelay}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  {displayChar}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}
