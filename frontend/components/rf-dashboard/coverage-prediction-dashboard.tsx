"use client";

import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyzeButton } from "./analyze-button";
import { DashboardNav } from "./dashboard-nav";
import { SystemStatusPill } from "./system-status-pill";
import {
  analyzeCoverage,
  type CoverageComparisonPoint,
  type CoverageInput,
  type CoveragePoint,
  type LinkBudgetModel,
} from "@/lib/rf-data";

const modelOptions: Array<{ value: LinkBudgetModel; label: string }> = [
  { value: "free_space", label: "free_space" },
  { value: "urban", label: "urban" },
  { value: "suburban", label: "suburban" },
];

const modelColors: Record<LinkBudgetModel, string> = {
  free_space: "#f59e0b",
  urban: "#ef4444",
  suburban: "#34d399",
};

const modelColorSwatches: Record<LinkBudgetModel, string> = {
  free_space: "#f59e0b",
  urban: "#ef4444",
  suburban: "#34d399",
};

interface CoverageSummaryCardProps {
  label: string;
  value: string;
  delay: number;
}

function CoverageSummaryCard({ label, value, delay }: CoverageSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="rounded-xl border border-border/50 bg-secondary/35 p-4"
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </motion.div>
  );
}

export function CoveragePredictionDashboard() {
  const [txPowerDbm, setTxPowerDbm] = useState(30);
  const [txAntennaGainDbi, setTxAntennaGainDbi] = useState(10);
  const [rxAntennaGainDbi, setRxAntennaGainDbi] = useState(10);
  const [frequencyMhz, setFrequencyMhz] = useState(2400);
  const [receiverSensitivityDbm, setReceiverSensitivityDbm] = useState(-90);
  const [model, setModel] = useState<LinkBudgetModel>("free_space");

  const [coveragePoints, setCoveragePoints] = useState<CoveragePoint[]>([]);
  const [comparisonData, setComparisonData] = useState<CoverageComparisonPoint[]>([]);
  const [coverageRadiusKm, setCoverageRadiusKm] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNumberInput = useCallback((setter: (value: number) => void, rawValue: string) => {
    const parsedValue = Number(rawValue);
    setter(Number.isFinite(parsedValue) ? parsedValue : 0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const input: CoverageInput = {
        txPowerDbm,
        txAntennaGainDbi,
        rxAntennaGainDbi,
        frequencyMhz,
        receiverSensitivityDbm,
        model,
      };

      const results = await analyzeCoverage(input);
      setCoveragePoints(results.coveragePoints);
      setComparisonData(results.comparisonData);
      setCoverageRadiusKm(results.coverageRadiusKm);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    txPowerDbm,
    txAntennaGainDbi,
    rxAntennaGainDbi,
    frequencyMhz,
    receiverSensitivityDbm,
    model,
  ]);

  const coveredCount = useMemo(
    () => coveragePoints.filter((point) => point.isCovered).length,
    [coveragePoints]
  );
  const goodCount = useMemo(
    () => coveragePoints.filter((point) => point.signalQuality === "Good").length,
    [coveragePoints]
  );
  const fairCount = useMemo(
    () => coveragePoints.filter((point) => point.signalQuality === "Fair").length,
    [coveragePoints]
  );
  const poorCount = useMemo(
    () => coveragePoints.filter((point) => point.signalQuality === "Poor").length,
    [coveragePoints]
  );
  const sensitivityLineColor = modelColors[model];
  const notCoveredCount = coveragePoints.length - coveredCount;
  const computedFarthestCovered = useMemo(() => {
    const points = coveragePoints.filter((point) => point.isCovered);
    if (points.length === 0) {
      return null;
    }
    return points[points.length - 1].distanceKm;
  }, [coveragePoints]);
  const coverageRadiusDisplay = coverageRadiusKm ?? computedFarthestCovered;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.2 240 / 0.4), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 290 / 0.4), transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-0 h-64 w-64 rounded-full blur-3xl opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.15 200 / 0.4), transparent 70%)",
          }}
        />
      </div>

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.95 0.01 260) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.95 0.01 260) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <SystemStatusPill />
          <h1 className="mb-3 text-3xl font-bold text-foreground text-balance md:text-4xl lg:text-5xl">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.95 0.01 260), oklch(0.65 0.2 240), oklch(0.55 0.22 290))",
              }}
            >
              RF x ML Wireless Intelligence Platform
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">Coverage Prediction</p>
        </motion.header>

        <DashboardNav />

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Coverage Inputs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure the RF link assumptions and run coverage prediction.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">TX Power (dBm)</span>
                <input
                  type="number"
                  value={txPowerDbm}
                  onChange={(event) => handleNumberInput(setTxPowerDbm, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">TX Antenna Gain (dBi)</span>
                <input
                  type="number"
                  value={txAntennaGainDbi}
                  onChange={(event) => handleNumberInput(setTxAntennaGainDbi, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">RX Antenna Gain (dBi)</span>
                <input
                  type="number"
                  value={rxAntennaGainDbi}
                  onChange={(event) => handleNumberInput(setRxAntennaGainDbi, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">Frequency (MHz)</span>
                <input
                  type="number"
                  value={frequencyMhz}
                  onChange={(event) => handleNumberInput(setFrequencyMhz, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">Receiver Sensitivity (dBm)</span>
                <input
                  type="number"
                  value={receiverSensitivityDbm}
                  onChange={(event) =>
                    handleNumberInput(setReceiverSensitivityDbm, event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">Path Loss Model</span>
                <select
                  value={model}
                  onChange={(event) => setModel(event.target.value as LinkBudgetModel)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                >
                  {modelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-center sm:justify-start">
              <AnalyzeButton
                onClick={handleAnalyze}
                isAnalyzing={isAnalyzing}
                idleLabel="Analyze Coverage"
                busyLabel="Analyzing Coverage..."
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Coverage Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Coverage points use distance vs received power from backend analysis.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <CoverageSummaryCard
                label="Covered Points"
                value={String(coveredCount)}
                delay={0.05}
              />
              <CoverageSummaryCard
                label="Not Covered"
                value={String(notCoveredCount)}
                delay={0.1}
              />
              <CoverageSummaryCard
                label="Coverage Radius"
                value={coverageRadiusDisplay === null ? "N/A" : `${coverageRadiusDisplay} km`}
                delay={0.15}
              />
              <CoverageSummaryCard
                label="Good Points"
                value={String(goodCount)}
                delay={0.2}
              />
              <CoverageSummaryCard
                label="Fair Points"
                value={String(fairCount)}
                delay={0.25}
              />
              <CoverageSummaryCard
                label="Poor Points"
                value={String(poorCount)}
                delay={0.3}
              />
            </div>

            <div className="mt-4 rounded-lg border border-border/45 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
              <p className="mb-2 font-medium">Model Color Key</p>
              <div className="flex flex-wrap gap-3">
                {modelOptions.map((option) => (
                  <span key={option.value} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: modelColorSwatches[option.value] }}
                    />
                    {option.label}
                  </span>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Coverage Curve</h3>
              <p className="text-sm text-muted-foreground">
                X-axis distance_km, Y-axis received_power_dbm
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Covered
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Not Covered
              </span>
            </div>
          </div>

          {coveragePoints.length === 0 ? (
            <div className="rounded-lg border border-border/40 bg-secondary/40 p-4 text-sm text-muted-foreground">
              Coverage data is not available yet. Click Analyze Coverage to generate points.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-80 w-full rounded-xl border border-border/45 bg-secondary/35 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coveragePoints} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                    <CartesianGrid stroke="oklch(0.28 0.03 260 / 0.35)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="distanceKm"
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickFormatter={(value: number) => `${value} km`}
                    />
                    <YAxis
                      domain={[
                        (dataMin: number) => Math.min(dataMin, receiverSensitivityDbm) - 2,
                        (dataMax: number) => Math.max(dataMax, receiverSensitivityDbm) + 2,
                      ]}
                      tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                      axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                      tickFormatter={(value: number) => `${value.toFixed(0)} dBm`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.14 0.03 260)",
                        border: "1px solid oklch(0.28 0.03 260)",
                        borderRadius: "10px",
                        color: "oklch(0.95 0.01 260)",
                      }}
                      formatter={(value: number, key: string, entry) => {
                        if (key === "receivedPowerDbm") {
                          return [`${value.toFixed(2)} dBm`, "Received Power"];
                        }
                        return [String(value), key];
                      }}
                      labelFormatter={(label: number) => {
                        const found = coveragePoints.find((point) => point.distanceKm === label);
                        if (!found) {
                          return `Distance: ${label} km`;
                        }
                        return `Distance: ${label} km | Link Margin: ${found.linkMarginDb.toFixed(2)} dB`;
                      }}
                    />
                    <Legend />
                    <ReferenceLine
                      y={receiverSensitivityDbm}
                      stroke={sensitivityLineColor}
                      strokeDasharray="6 4"
                      label={{
                        value: `${model} sensitivity ${receiverSensitivityDbm} dBm`,
                        position: "insideTopRight",
                        fill: "oklch(0.78 0.03 260)",
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="receivedPowerDbm"
                      stroke="oklch(0.8 0.12 200)"
                      strokeWidth={2}
                      name="Received Power"
                      dot={(props) => {
                        const point = props.payload as CoveragePoint;
                        const fill = point.isCovered ? "#34d399" : "#fb7185";
                        return (
                          <circle
                            key={`coverage-dot-${point.distanceKm}`}
                            cx={props.cx}
                            cy={props.cy}
                            r={4}
                            fill={fill}
                            stroke="oklch(0.25 0.04 260)"
                            strokeWidth={1}
                          />
                        );
                      }}
                      activeDot={{ r: 6 }}
                      animationDuration={700}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="max-h-52 overflow-auto rounded-xl border border-border/45 bg-secondary/25 p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="px-2 py-1 text-left font-medium">Distance (km)</th>
                      <th className="px-2 py-1 text-left font-medium">Received Power (dBm)</th>
                      <th className="px-2 py-1 text-left font-medium">Link Margin (dB)</th>
                      <th className="px-2 py-1 text-left font-medium">Coverage</th>
                      <th className="px-2 py-1 text-left font-medium">Signal Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coveragePoints.map((point) => (
                      <tr key={point.distanceKm} className="border-t border-border/30 text-foreground">
                        <td className="px-2 py-1.5">{point.distanceKm}</td>
                        <td className="px-2 py-1.5">{point.receivedPowerDbm.toFixed(2)}</td>
                        <td className="px-2 py-1.5">{point.linkMarginDb.toFixed(2)}</td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              point.isCovered
                                ? "bg-emerald-400/20 text-emerald-300"
                                : "bg-rose-400/20 text-rose-300"
                            }`}
                          >
                            {point.isCovered ? "covered" : "not covered"}
                          </span>
                        </td>
                        <td className="px-2 py-1.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              point.signalQuality === "Good"
                                ? "bg-emerald-400/20 text-emerald-300"
                                : point.signalQuality === "Fair"
                                  ? "bg-amber-400/20 text-amber-300"
                                  : point.signalQuality === "Poor"
                                    ? "bg-rose-400/20 text-rose-300"
                                    : "bg-slate-400/20 text-slate-300"
                            }`}
                          >
                            {point.signalQuality}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-6 rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-foreground">Coverage Model Comparison</h3>
            <p className="text-sm text-muted-foreground">
              X-axis distance_km, Y-axis received power (dBm)
            </p>
          </div>

          {comparisonData.length === 0 ? (
            <div className="rounded-lg border border-border/40 bg-secondary/40 p-4 text-sm text-muted-foreground">
              Comparison data is not available yet. Click Analyze Coverage to generate points.
            </div>
          ) : (
            <div className="h-80 w-full rounded-xl border border-border/45 bg-secondary/35 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                  <CartesianGrid stroke="oklch(0.28 0.03 260 / 0.35)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="distance_km"
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickFormatter={(value: number) => `${value} km`}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.72 0.02 260)", fontSize: 11 }}
                    axisLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickLine={{ stroke: "oklch(0.3 0.03 260)" }}
                    tickFormatter={(value: number) => `${value.toFixed(0)} dBm`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.14 0.03 260)",
                      border: "1px solid oklch(0.28 0.03 260)",
                      borderRadius: "10px",
                      color: "oklch(0.95 0.01 260)",
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} dBm`]}
                    labelFormatter={(label: number) => `Distance: ${label} km`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="free_space"
                    stroke={modelColorSwatches.free_space}
                    strokeWidth={2}
                    dot={false}
                    name="free_space"
                    animationDuration={700}
                  />
                  <Line
                    type="monotone"
                    dataKey="urban"
                    stroke={modelColorSwatches.urban}
                    strokeWidth={2}
                    dot={false}
                    name="urban"
                    animationDuration={700}
                  />
                  <Line
                    type="monotone"
                    dataKey="suburban"
                    stroke={modelColorSwatches.suburban}
                    strokeWidth={2}
                    dot={false}
                    name="suburban"
                    animationDuration={700}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}
