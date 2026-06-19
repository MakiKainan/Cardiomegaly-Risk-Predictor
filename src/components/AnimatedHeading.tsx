import React, { useState, useEffect } from 'react';

interface AnimatedHeadingProps {
  text: string;
  className?: string;
  id?: string;
}

export default function AnimatedHeading({ text, className = '', id }: AnimatedHeadingProps) {
  const [isAnimated, setIsAnimated] = useState(false);
  const lines = text.split('\n');

  useEffect(() => {
    // Initial delay of 200ms before triggering the entrance transitions
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <h1 id={id} className={`leading-tight font-normal ${className}`}>
      {lines.map((line, lineIndex) => {
        // Calculate lineLength for stagger delay calculations
        const lineLength = line.length;
        return (
          <span key={lineIndex} className="block whitespace-pre select-none">
            {line.split('').map((char, charIndex) => {
              // Stagger delay formula as specified: (lineIndex * lineLength * 30ms) + (charIndex * 30ms)
              const staggerDelay = (lineIndex * lineLength * 30) + (charIndex * 30);
              
              // Handle spaces representation
              const displayChar = char === ' ' ? '\u00A0' : char;

              return (
                <span
                  key={charIndex}
                  className="inline-block transition-all"
                  style={{
                    opacity: isAnimated ? 1 : 0,
                    transform: isAnimated ? 'translateX(0)' : 'translateX(-18px)',
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
