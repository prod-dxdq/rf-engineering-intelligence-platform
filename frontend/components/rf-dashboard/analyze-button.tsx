"use client";

import { motion } from "framer-motion";

interface AnalyzeButtonProps {
  onClick: () => void;
  isAnalyzing: boolean;
}

export function AnalyzeButton({ onClick, isAnalyzing }: AnalyzeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isAnalyzing}
      whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
      whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
      className="relative group w-full sm:w-auto"
    >
      {/* Animated glow border */}
      <motion.div
        className="absolute -inset-0.5 rounded-xl opacity-75 blur-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
        }}
        animate={{
          background: isAnalyzing
            ? [
                "linear-gradient(135deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
                "linear-gradient(225deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
                "linear-gradient(315deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
                "linear-gradient(45deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
                "linear-gradient(135deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
              ]
            : "linear-gradient(135deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290), oklch(0.7 0.15 200))",
        }}
        transition={{
          duration: 2,
          repeat: isAnalyzing ? Infinity : 0,
          ease: "linear",
        }}
      />

      {/* Button content */}
      <div className="relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-card border border-border font-semibold text-foreground transition-colors">
        {/* Icon */}
        <motion.div
          animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 1,
            repeat: isAnalyzing ? Infinity : 0,
            ease: "linear",
          }}
        >
          {isAnalyzing ? (
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </motion.div>

        <span>{isAnalyzing ? "Analyzing..." : "Analyze Receiver Chain"}</span>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, oklch(1 0 0 / 0.1) 50%, transparent 60%)",
          }}
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </motion.button>
  );
}
