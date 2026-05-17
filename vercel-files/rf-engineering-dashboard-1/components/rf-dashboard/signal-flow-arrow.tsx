"use client";

import { motion } from "framer-motion";

interface SignalFlowArrowProps {
  index: number;
}

export function SignalFlowArrow({ index }: SignalFlowArrowProps) {
  return (
    <div className="flex items-center justify-center px-2">
      <div className="relative w-16 h-8 flex items-center">
        {/* Arrow line */}
        <svg
          className="w-full h-full"
          viewBox="0 0 64 32"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${index}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient
              id={`arrow-gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="oklch(0.65 0.2 240)" />
              <stop offset="50%" stopColor="oklch(0.7 0.15 200)" />
              <stop offset="100%" stopColor="oklch(0.55 0.22 290)" />
            </linearGradient>
          </defs>

          {/* Background line */}
          <line
            x1="0"
            y1="16"
            x2="52"
            y2="16"
            stroke="oklch(0.25 0.03 270)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Animated signal pulse */}
          <motion.line
            x1="0"
            y1="16"
            x2="52"
            y2="16"
            stroke={`url(#arrow-gradient-${index})`}
            strokeWidth="2"
            strokeLinecap="round"
            filter={`url(#glow-${index})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3,
              ease: "easeInOut",
              times: [0, 0.4, 0.6, 1],
            }}
          />

          {/* Arrow head */}
          <motion.path
            d="M48 10 L58 16 L48 22"
            stroke={`url(#arrow-gradient-${index})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter={`url(#glow-${index})`}
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3 + 0.5,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* Animated particles */}
        <motion.div
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            background: "oklch(0.7 0.15 200)",
            boxShadow: "0 0 6px 2px oklch(0.7 0.15 200 / 0.6)",
          }}
          animate={{
            x: [0, 48, 48, 0],
            opacity: [0, 1, 0, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut",
            times: [0, 0.5, 0.7, 1],
          }}
        />
      </div>
    </div>
  );
}
