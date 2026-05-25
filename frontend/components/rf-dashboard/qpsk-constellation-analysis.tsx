"use client";

import { motion } from "framer-motion";
import {
  CartesianGrid,
  LabelList,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { QpskConstellationPoint } from "@/lib/rf-data";

interface QPSKConstellationAnalysisProps {
  qpskConstellation?: QpskConstellationPoint[];
  actionLabel?: string;
}

interface LabeledQpskPoint extends QpskConstellationPoint {
  quadrant: string;
}

interface QuadrantLabelProps {
  x?: number;
  y?: number;
  value?: string | number;
}

function getQuadrantLabel(i: number, q: number): string {
  if (i >= 0 && q >= 0) {
    return "Q1";
  }
  if (i < 0 && q >= 0) {
    return "Q2";
  }
  if (i < 0 && q < 0) {
    return "Q3";
  }
  return "Q4";
}

function NeonConstellationPoint({ cx = 0, cy = 0 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill="oklch(0.72 0.22 155 / 0.2)"
        className="animate-pulse"
      />
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        fill="oklch(0.72 0.22 155)"
        stroke="oklch(0.98 0.01 260)"
        strokeWidth={1.4}
      />
      <circle cx={cx} cy={cy} r={2.6} fill="oklch(0.99 0.01 260)" />
    </g>
  );
}

function QuadrantLabel({ x = 0, y = 0, value }: QuadrantLabelProps) {
  return (
    <text
      x={x}
      y={y}
      dy={-12}
      textAnchor="middle"
      fill="oklch(0.98 0.01 260)"
      fontSize={12}
      fontWeight={800}
      stroke="oklch(0.14 0.03 260 / 0.95)"
      strokeWidth={3}
      paintOrder="stroke"
      style={{ letterSpacing: "0.04em" }}
    >
      {value}
    </text>
  );
}

export function QPSKConstellationAnalysis({
  qpskConstellation = [],
  actionLabel = "Analyze Receiver Chain",
}: QPSKConstellationAnalysisProps) {
  const safeConstellationData = Array.isArray(qpskConstellation)
    ? qpskConstellation
    : [];
  const idealLabeledPoints: LabeledQpskPoint[] = [
    { i: 1, q: 1, quadrant: getQuadrantLabel(1, 1) },
    { i: -1, q: 1, quadrant: getQuadrantLabel(-1, 1) },
    { i: -1, q: -1, quadrant: getQuadrantLabel(-1, -1) },
    { i: 1, q: -1, quadrant: getQuadrantLabel(1, -1) },
  ];
  const maxAbs = safeConstellationData.reduce(
    (currentMax, point) => Math.max(currentMax, Math.abs(point.i), Math.abs(point.q)),
    1.5
  );
  const axisLimit = Math.max(1.5, Math.ceil((maxAbs + 0.15) * 4) / 4);
  const axisTicks = [-axisLimit, -axisLimit / 2, 0, axisLimit / 2, axisLimit];

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
      transition={{ duration: 0.6, delay: 0.9 }}
      className="relative"
    >
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-40 blur-md"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.25), oklch(0.55 0.22 290 / 0.25))",
        }}
      />

      <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <div
            className="p-2 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.2 240 / 0.2), oklch(0.55 0.22 290 / 0.2))",
            }}
          >
            <svg
              className="w-5 h-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 12h18" />
              <path d="M12 3v18" />
              <circle cx="7" cy="7" r="1.75" />
              <circle cx="17" cy="7" r="1.75" />
              <circle cx="7" cy="17" r="1.75" />
              <circle cx="17" cy="17" r="1.75" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              QPSK Constellation Analysis
            </h3>
            <p className="text-xs text-muted-foreground">
              In-phase (I) and quadrature (Q) symbol distribution from backend output
            </p>
          </div>
        </div>

        {safeConstellationData.length === 0 ? (
          <div className="rounded-lg bg-secondary/40 border border-border/40 p-4 text-sm text-muted-foreground">
            QPSK constellation data is not available yet. Click {actionLabel} to generate constellation points.
          </div>
        ) : (
          <div className="rounded-xl bg-secondary/35 border border-border/45 p-4">
            <h4 className="text-sm font-semibold text-foreground mb-3">Q vs I Scatter</h4>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                  <ReferenceArea
                    x1={-axisLimit}
                    x2={0}
                    y1={0}
                    y2={axisLimit}
                    fill="oklch(0.7 0.18 150 / 0.05)"
                    ifOverflow="extendDomain"
                  />
                  <ReferenceArea
                    x1={0}
                    x2={axisLimit}
                    y1={0}
                    y2={axisLimit}
                    fill="oklch(0.65 0.2 240 / 0.05)"
                    ifOverflow="extendDomain"
                  />
                  <ReferenceArea
                    x1={-axisLimit}
                    x2={0}
                    y1={-axisLimit}
                    y2={0}
                    fill="oklch(0.55 0.22 290 / 0.05)"
                    ifOverflow="extendDomain"
                  />
                  <ReferenceArea
                    x1={0}
                    x2={axisLimit}
                    y1={-axisLimit}
                    y2={0}
                    fill="oklch(0.8 0.12 200 / 0.04)"
                    ifOverflow="extendDomain"
                  />
                  <CartesianGrid
                    stroke="oklch(0.38 0.04 260 / 0.45)"
                    strokeDasharray="3 3"
                  />
                  <ReferenceLine x={0} stroke="oklch(0.62 0.09 250 / 0.9)" strokeWidth={1.5} />
                  <ReferenceLine y={0} stroke="oklch(0.62 0.09 250 / 0.9)" strokeWidth={1.5} />
                  <XAxis
                    type="number"
                    dataKey="i"
                    name="I"
                    domain={[-axisLimit, axisLimit]}
                    ticks={axisTicks}
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    label={{
                      value: "I",
                      position: "insideBottom",
                      offset: -4,
                      fill: "oklch(0.72 0.02 260)",
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="q"
                    name="Q"
                    domain={[-axisLimit, axisLimit]}
                    ticks={axisTicks}
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    label={{
                      value: "Q",
                      angle: -90,
                      position: "insideLeft",
                      fill: "oklch(0.72 0.02 260)",
                    }}
                  />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: "oklch(0.96 0.01 260)" }}
                    itemStyle={{ color: "oklch(0.96 0.01 260)" }}
                    formatter={(value: number, name: string) => [value.toFixed(3), name]}
                  />
                  <Scatter
                    data={safeConstellationData}
                    shape={<NeonConstellationPoint />}
                    legendType="none"
                  />
                  <Scatter
                    data={idealLabeledPoints}
                    fill="oklch(0.98 0.01 260 / 0.01)"
                    legendType="none"
                  >
                    <LabelList
                      dataKey="quadrant"
                      content={<QuadrantLabel />}
                    />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Larger neon pulse markers and Q1-Q4 labels make symbol positions obvious at a glance.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
