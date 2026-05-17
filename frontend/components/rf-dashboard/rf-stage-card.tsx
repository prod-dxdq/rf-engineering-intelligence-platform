"use client";

import { motion } from "framer-motion";
import type { RFStage } from "@/lib/rf-data";

interface RFStageCardProps {
  stage: RFStage;
  index: number;
  onMetricChange: (
    stageId: string,
    field: "gain" | "noiseFigure" | "ip3",
    value: number
  ) => void;
}

function StageIcon({ type }: { type: RFStage["icon"] }) {
  const iconClass = "w-8 h-8 text-primary";

  switch (type) {
    case "lna":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 12h4l3-8 4 16 3-8h4" />
          <circle cx="12" cy="12" r="10" strokeDasharray="2 2" opacity="0.3" />
        </svg>
      );
    case "mixer":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="8" />
          <path d="M8 8l8 8M16 8l-8 8" />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
        </svg>
      );
    case "ifamp":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 12h2l4-8v16l4-8h2" />
          <path d="M18 8v8" strokeDasharray="2 2" />
          <path d="M20 10v4" strokeDasharray="2 2" />
        </svg>
      );
  }
}

function MetricInputRow({
  label,
  value,
  unit,
  color,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <input
          type="number"
          step="0.1"
          value={value}
          onChange={(event) => {
            const nextValue = Number.parseFloat(event.target.value);
            onChange(Number.isFinite(nextValue) ? nextValue : 0);
          }}
          className={`w-20 bg-transparent text-right text-lg font-mono font-semibold ${color} border-none outline-none focus:ring-0`}
        />
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

export function RFStageCard({ stage, index, onMetricChange }: RFStageCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative"
    >
      {/* Glow effect */}
      <div
        className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.4), oklch(0.55 0.22 290 / 0.4))",
        }}
      />

      {/* Card content */}
      <div className="relative bg-card border border-border rounded-xl p-5 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.2), oklch(0.55 0.22 290 / 0.2))",
              }}
            >
              <StageIcon type={stage.icon} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{stage.shortName}</h3>
              <p className="text-xs text-muted-foreground">{stage.name}</p>
            </div>
          </div>
          <motion.div
            className="w-2 h-2 rounded-full bg-primary"
            animate={{
              boxShadow: [
                "0 0 4px 2px oklch(0.65 0.2 240 / 0.5)",
                "0 0 8px 4px oklch(0.65 0.2 240 / 0.8)",
                "0 0 4px 2px oklch(0.65 0.2 240 / 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
          {stage.description}
        </p>

        {/* Metrics */}
        <div className="space-y-1">
          <MetricInputRow
            label="Gain"
            value={stage.gain}
            unit="dB"
            color={stage.gain >= 0 ? "text-emerald-400" : "text-amber-400"}
            onChange={(value) => onMetricChange(stage.id, "gain", value)}
          />
          <MetricInputRow
            label="Noise Figure"
            value={stage.noiseFigure}
            unit="dB"
            color="text-sky-400"
            onChange={(value) => onMetricChange(stage.id, "noiseFigure", value)}
          />
          <MetricInputRow
            label="IP3"
            value={stage.ip3}
            unit="dBm"
            color="text-violet-400"
            onChange={(value) => onMetricChange(stage.id, "ip3", value)}
          />
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent, oklch(0.65 0.2 240), oklch(0.55 0.22 290), transparent)",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
        />
      </div>
    </motion.div>
  );
}
