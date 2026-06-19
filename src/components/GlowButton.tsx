import React, { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  MotionValue,
} from "motion/react";

// Simple custom utility since cn might not exist
function cn(...classes: (string | undefined | null | boolean)[]) {
  return classes.filter(Boolean).join(" ");
}

// ─── Gradient layer ───────────────────────────────────────────────────────────
function GradientLayer({
  springX,
  springY,
  gradientColor,
  opacity,
  multiplier,
}: {
  springX: MotionValue<number>;
  springY: MotionValue<number>;
  gradientColor: string;
  opacity: number;
  multiplier: number;
}) {
  const x = useTransform(springX, (v) => v * multiplier);
  const y = useTransform(springY, (v) => v * multiplier);
  const background = useMotionTemplate`radial-gradient(circle at ${x}px ${y}px, ${gradientColor} 0%, transparent 50%)`;
  return (
    <motion.div className="absolute inset-0" style={{ opacity, background }} />
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface GlowButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** Override the three gradient stop colors */
  gradientColors?: [string, string, string];
  speed?: number;
  noiseIntensity?: number;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GlowButton({
  children = "Try Demo →",
  onClick,
  className,
  gradientColors = [
    "rgb(30, 111, 217)",   // accent blue
    "rgb(100, 180, 255)",  // lighter cyan-blue
    "rgb(10, 60, 140)",    // deep navy
  ],
  speed = 0.08,
  noiseIntensity = 0.18,
}: GlowButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 100, damping: 30 });
  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const topGradientX = useTransform(springX, (v) => v * 0.1 - 50);

  const velocityRef = useRef({ x: 0, y: 0 });
  const lastDirRef = useRef(0);
  const genVelocity = useRef(() => {
    const angle = Math.random() * Math.PI * 2;
    const mag = speed * (0.5 + Math.random() * 0.5);
    return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
  });

  useEffect(() => {
    genVelocity.current = () => {
      const angle = Math.random() * Math.PI * 2;
      const mag = speed * (0.5 + Math.random() * 0.5);
      return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
    };
    velocityRef.current = genVelocity.current();
  }, [speed]);

  useEffect(() => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    x.set(width / 2);
    y.set(height / 2);
  }, [x, y]);

  useAnimationFrame((time) => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (time - lastDirRef.current > 1500 + Math.random() * 1500) {
      velocityRef.current = genVelocity.current();
      lastDirRef.current = time;
    }
    const pad = 20;
    let nx = x.get() + velocityRef.current.x * 16;
    let ny = y.get() + velocityRef.current.y * 16;
    if (nx < pad || nx > width - pad || ny < pad || ny > height - pad) {
      velocityRef.current = genVelocity.current();
      lastDirRef.current = time;
      nx = Math.max(pad, Math.min(width - pad, nx));
      ny = Math.max(pad, Math.min(height - pad, ny));
    }
    x.set(nx);
    y.set(ny);
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        // pill wrapper — this is the glowing border
        "relative overflow-hidden rounded-full p-[2px]",
        "bg-neutral-900",
        // subtle outer shadow
        "shadow-[0px_0px_0px_1px_rgba(30,111,217,0.25)]",
        className
      )}
      style={{ "--noise-opacity": noiseIntensity } as React.CSSProperties}
    >
      {/* ── animated gradient layers (form the glowing border) ── */}
      <GradientLayer springX={springX} springY={springY} gradientColor={gradientColors[0]} opacity={0.9} multiplier={1} />
      <GradientLayer springX={springX} springY={springY} gradientColor={gradientColors[1]} opacity={0.6} multiplier={0.7} />
      <GradientLayer springX={springX} springY={springY} gradientColor={gradientColors[2]} opacity={0.5} multiplier={1.2} />

      {/* ── top shimmer strip ── */}
      <motion.div
        className="absolute inset-x-0 top-0 h-px rounded-t-full opacity-90 blur-[1px]"
        style={{
          background: `linear-gradient(to right, ${gradientColors.join(", ")})`,
          x: topGradientX,
        }}
      />

      {/* ── noise overlay ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <img
          src="https://assets.aceternity.com/noise.webp"
          alt=""
          className="h-full w-full object-cover opacity-[var(--noise-opacity)]"
          style={{ mixBlendMode: "overlay" }}
          referrerPolicy="no-referrer"
        />
      </div>

      {/* ── actual button surface ── */}
      <button
        onClick={onClick}
        className={cn(
          "relative z-10 flex cursor-pointer items-center justify-center rounded-full w-full",
          // inner surface — deep navy pill
          "bg-[#070E1C] px-7 py-2.5",
          // typography
          "font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-xs font-semibold tracking-wider text-white uppercase",
          // subtle inner highlight at top
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]",
          // press state
          "transition-transform duration-100 active:scale-[0.97]",
        )}
      >
        {children}
      </button>
    </div>
  );
}
