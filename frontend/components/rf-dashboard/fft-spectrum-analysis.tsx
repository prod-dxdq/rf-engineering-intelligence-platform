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
import type { SpectrumDataPoint } from "@/lib/rf-data";

interface FFTSpectrumAnalysisProps {
  spectrumData?: SpectrumDataPoint[];
  actionLabel?: string;
}

export function FFTSpectrumAnalysis({
  spectrumData = [],
  actionLabel = "Analyze Receiver Chain",
}: FFTSpectrumAnalysisProps) {
  const safeSpectrumData = Array.isArray(spectrumData) ? spectrumData : [];

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
      transition={{ duration: 0.6, delay: 0.8 }}
      className="relative"
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-40 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.7 0.18 150 / 0.25), oklch(0.65 0.2 240 / 0.25))",
        }}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.7 0.18 150 / 0.2), oklch(0.65 0.2 240 / 0.2))",
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
              <path d="M4 16c2.5-6 4.5-6 7 0s4.5 6 7 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">FFT Spectrum Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Frequency-domain response from backend spectrum output
            </p>
          </div>
        </div>

        {safeSpectrumData.length === 0 ? (
          <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 text-sm text-muted-foreground">
            Spectrum data is not available yet. Click {actionLabel} to generate FFT data.
          </div>
        ) : (
          <div className="rounded-xl bg-secondary/35 border border-border/45 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Magnitude vs Frequency
            </h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={safeSpectrumData}
                  margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke="oklch(0.28 0.03 260 / 0.35)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="frequencyHz"
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickFormatter={(value: number) => `${Math.round(value)} Hz`}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(value: number) => `${value} Hz`}
                    formatter={(value: number) => [value.toFixed(4), "Magnitude"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="magnitude"
                    stroke="oklch(0.7 0.18 150)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    animationDuration={650}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
