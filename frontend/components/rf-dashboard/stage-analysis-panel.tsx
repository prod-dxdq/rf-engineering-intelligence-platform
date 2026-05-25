"use client";

import { motion } from "framer-motion";
import type { StageAnalysisItem } from "@/lib/rf-data";

interface StageAnalysisPanelProps {
  stageAnalysis?: StageAnalysisItem[];
}

function StageMetric({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | null | undefined;
  unit: string;
}) {
  const hasValue = value !== null && value !== undefined && Number.isFinite(value);

  return (
    <div className="rounded-md bg-secondary/40 border border-border/40 p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
      <p className="text-base font-mono font-semibold text-foreground">
        {hasValue ? `${value > 0 ? "+" : ""}${value.toFixed(2)}` : "N/A"}
      </p>
    </div>
  );
}

export function StageAnalysisPanel({ stageAnalysis = [] }: StageAnalysisPanelProps) {
  const safeStageAnalysis = Array.isArray(stageAnalysis) ? stageAnalysis : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="relative"
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-40 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.25), oklch(0.55 0.22 290 / 0.25))",
        }}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.2), oklch(0.55 0.22 290 / 0.2))",
            }}
          >
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
              <circle cx="7" cy="6" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
              <circle cx="17" cy="18" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Stage-by-Stage Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              Per-stage cumulative RF performance metrics
            </p>
          </div>
        </div>

        {safeStageAnalysis.length === 0 ? (
          <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 text-sm text-muted-foreground">
            N/A
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {safeStageAnalysis.map((stage, index) => (
              <motion.div
                key={`${stage.stage}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.08 * index }}
                className="rounded-xl bg-secondary/35 border border-border/45 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">{stage.stage}</p>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-secondary/60 border border-border/40 text-muted-foreground">
                    Stage {index + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <StageMetric
                    label="Cumulative Gain"
                    value={stage.cumulativeGain}
                    unit="dB"
                  />
                  <StageMetric
                    label="Stage Noise Figure"
                    value={stage.stageNoiseFigure}
                    unit="dB"
                  />
                  <StageMetric
                    label="Stage IP3"
                    value={stage.stageIP3}
                    unit="dBm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
