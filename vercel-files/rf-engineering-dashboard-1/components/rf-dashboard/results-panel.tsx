"use client";

import { motion } from "framer-motion";
import type { ReceiverChainResults } from "@/lib/rf-data";

interface ResultsPanelProps {
  results: ReceiverChainResults;
  isAnalyzing: boolean;
}

function ResultMetric({
  label,
  value,
  unit,
  description,
  color,
  delay,
}: {
  label: string;
  value: number;
  unit: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      {/* Glow background */}
      <div
        className="absolute -inset-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
        style={{
          background: `linear-gradient(135deg, ${color} / 0.2, transparent)`,
        }}
      />

      <div className="relative p-4 rounded-lg bg-secondary/50 border border-border/50">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
        <motion.div
          className={`text-3xl font-mono font-bold`}
          style={{ color }}
          key={value}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {value > 0 ? "+" : ""}
          {value.toFixed(2)}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-2 opacity-70">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export function ResultsPanel({ results, isAnalyzing }: ResultsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="relative"
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-50 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.3), oklch(0.55 0.22 290 / 0.3))",
        }}
      />

      {/* Main panel */}
      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.2), oklch(0.55 0.22 290 / 0.2))",
              }}
            >
              <svg
                className="w-6 h-6 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M9 17H7A5 5 0 0 1 7 7h2" />
                <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Cascaded Analysis Results
              </h2>
              <p className="text-xs text-muted-foreground">
                Calculated using Friis formula
              </p>
            </div>
          </div>

          {/* Status indicator */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50"
            animate={
              isAnalyzing
                ? {
                    borderColor: [
                      "oklch(0.25 0.03 270)",
                      "oklch(0.65 0.2 240)",
                      "oklch(0.25 0.03 270)",
                    ],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: isAnalyzing ? Infinity : 0 }}
          >
            <motion.div
              className={`w-2 h-2 rounded-full ${
                isAnalyzing ? "bg-amber-400" : "bg-emerald-400"
              }`}
              animate={{
                scale: isAnalyzing ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.8, repeat: isAnalyzing ? Infinity : 0 }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {isAnalyzing ? "Analyzing..." : "Ready"}
            </span>
          </motion.div>
        </div>

        {/* Results grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultMetric
            label="Total Gain"
            value={results.totalGain}
            unit="dB"
            description="Sum of all stage gains"
            color="oklch(0.7 0.18 150)"
            delay={0.1}
          />
          <ResultMetric
            label="System Noise Figure"
            value={results.totalNoiseFigure}
            unit="dB"
            description="Cascaded NF (Friis)"
            color="oklch(0.7 0.15 200)"
            delay={0.2}
          />
          <ResultMetric
            label="Input IP3"
            value={results.inputIP3}
            unit="dBm"
            description="Input-referred intercept point"
            color="oklch(0.65 0.2 290)"
            delay={0.3}
          />
        </div>

        {/* Performance indicators */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dynamic Range Estimate</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290))",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: "72%" }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </div>
              <span className="font-mono text-muted-foreground">
                {(results.inputIP3 - results.totalNoiseFigure - 10).toFixed(1)} dB
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
