import React, { useState, useEffect } from 'react';

interface FadeInProps {
  delay: number;
  duration?: number;
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function FadeIn({ delay, duration = 1000, children, className = '', id }: FadeInProps) {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRendered(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      id={id}
      className={`transition-opacity ease-out ${isRendered ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
