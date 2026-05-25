"use client";

import { motion } from "framer-motion";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StageAnalysisItem } from "@/lib/rf-data";

interface RFSystemVisualizationProps {
  stageAnalysis?: StageAnalysisItem[];
}

export function RFSystemVisualization({ stageAnalysis }: RFSystemVisualizationProps) {
  const safeStageAnalysis = stageAnalysis ?? [];

  const chartData = safeStageAnalysis.map((stage, index) => ({
    stage: stage.stage || `Stage ${index + 1}`,
    cumulativeGain: stage.cumulativeGain,
    stageNoiseFigure: stage.stageNoiseFigure,
  }));

  const tooltipStyle = {
    backgroundColor: "oklch(0.14 0.03 260)",
    border: "1px solid oklch(0.28 0.03 260)",
    borderRadius: "10px",
    color: "oklch(0.95 0.01 260)",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.75 }}
      className="relative"
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-40 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.25), oklch(0.7 0.15 200 / 0.25))",
        }}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.2), oklch(0.7 0.15 200 / 0.2))",
            }}
          >
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 3v18h18" />
              <path d="M7 15l4-4 3 2 5-6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              RF System Visualization
            </h3>
            <p className="text-xs text-muted-foreground">
              Stage-by-stage gain and noise figure trends
            </p>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 text-sm text-muted-foreground">
            N/A
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="rounded-xl bg-secondary/35 border border-border/45 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Cumulative Gain vs Stage
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="oklch(0.28 0.03 260 / 0.35)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="stage"
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      unit=" dB"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="cumulativeGain"
                      stroke="oklch(0.7 0.18 150)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "oklch(0.7 0.18 150)" }}
                      activeDot={{ r: 6 }}
                      animationDuration={650}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-secondary/35 border border-border/45 p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Stage Noise Figure vs Stage
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="oklch(0.28 0.03 260 / 0.35)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="stage"
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      unit=" dB"
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line
                      type="monotone"
                      dataKey="stageNoiseFigure"
                      stroke="oklch(0.7 0.15 200)"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "oklch(0.7 0.15 200)" }}
                      activeDot={{ r: 6 }}
                      animationDuration={650}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
