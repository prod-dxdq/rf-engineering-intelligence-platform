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
import type { BerVsSnrPoint } from "@/lib/rf-data";

interface BerVsSnrAnalysisProps {
  berVsSnr?: BerVsSnrPoint[];
  actionLabel?: string;
}

export function BerVsSnrAnalysis({
  berVsSnr = [],
  actionLabel = "Analyze Receiver Chain",
}: BerVsSnrAnalysisProps) {
  const safeBerVsSnrData = Array.isArray(berVsSnr) ? berVsSnr : [];

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
      transition={{ duration: 0.6, delay: 1 }}
      className="relative"
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-40 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.8 0.12 200 / 0.25), oklch(0.65 0.2 240 / 0.25))",
        }}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.8 0.12 200 / 0.2), oklch(0.65 0.2 240 / 0.2))",
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
              <path d="M5 16l4-4 4 2 6-8" />
              <circle cx="9" cy="12" r="1.1" />
              <circle cx="13" cy="14" r="1.1" />
              <circle cx="19" cy="6" r="1.1" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">BER vs SNR Analysis</h3>
            <p className="text-xs text-muted-foreground">
              Bit Error Rate decreases as Signal-to-Noise Ratio increases.
            </p>
          </div>
        </div>

        {safeBerVsSnrData.length === 0 ? (
          <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 text-sm text-muted-foreground">
            BER vs SNR data is not available yet. Click {actionLabel} to generate BER trend data.
          </div>
        ) : (
          <div className="rounded-xl bg-secondary/35 border border-border/45 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">BER vs SNR Curve</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={safeBerVsSnrData}
                  margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke="oklch(0.28 0.03 260 / 0.35)"
                    strokeDasharray="3 3"
                  />
                  <XAxis
                    dataKey="snrDb"
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickFormatter={(value: number) => `${value} dB`}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickFormatter={(value: number) => value.toFixed(3)}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(value: number) => `SNR: ${value} dB`}
                    formatter={(value: number) => [value.toFixed(4), "BER"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="ber"
                    stroke="oklch(0.8 0.12 200)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    animationDuration={700}
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
