"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AnalyzeButton } from "./analyze-button";
import { DashboardNav } from "./dashboard-nav";
import { SystemStatusPill } from "./system-status-pill";
import {
  analyzeMlSignalIntelligence,
  type LinkBudgetModel,
  type MlSignalIntelligenceInput,
  type MlSignalIntelligenceResult,
} from "@/lib/rf-data";

const modelOptions: Array<{ value: LinkBudgetModel; label: string }> = [
  { value: "free_space", label: "Free Space" },
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
];

const initialResult: MlSignalIntelligenceResult = {
  receivedPowerDbm: null,
  linkMarginDb: null,
  predictedSignalQuality: "Unknown",
  evaluatedDistanceKm: 1,
};

interface ResultCardProps {
  label: string;
  value: string;
  delay: number;
}

function ResultCard({ label, value, delay }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border/50 bg-secondary/35 p-4"
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
    </motion.div>
  );
}

function formatDbm(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(2)} dBm`;
}

function formatDb(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(2)} dB`;
}

function qualityClasses(quality: MlSignalIntelligenceResult["predictedSignalQuality"]): string {
  if (quality === "Good") {
    return "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30";
  }
  if (quality === "Fair") {
    return "bg-amber-400/20 text-amber-300 border border-amber-400/30";
  }
  if (quality === "Poor") {
    return "bg-rose-400/20 text-rose-300 border border-rose-400/30";
  }
  return "bg-slate-400/20 text-slate-300 border border-slate-400/30";
}

export function MlSignalIntelligenceDashboard() {
  const [txPowerDbm, setTxPowerDbm] = useState(30);
  const [txAntennaGainDbi, setTxAntennaGainDbi] = useState(10);
  const [rxAntennaGainDbi, setRxAntennaGainDbi] = useState(10);
  const [frequencyMhz, setFrequencyMhz] = useState(2400);
  const [distanceKm, setDistanceKm] = useState(5);
  const [receiverSensitivityDbm, setReceiverSensitivityDbm] = useState(-90);
  const [model, setModel] = useState<LinkBudgetModel>("free_space");

  const [result, setResult] = useState<MlSignalIntelligenceResult>(initialResult);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNumberInput = useCallback((setter: (value: number) => void, rawValue: string) => {
    const parsedValue = Number(rawValue);
    setter(Number.isFinite(parsedValue) ? parsedValue : 0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const input: MlSignalIntelligenceInput = {
        txPowerDbm,
        txAntennaGainDbi,
        rxAntennaGainDbi,
        frequencyMhz,
        distanceKm,
        receiverSensitivityDbm,
        model,
      };

      const prediction = await analyzeMlSignalIntelligence(input);
      setResult(prediction);
    } catch {
      setResult((previous) => ({
        ...previous,
        receivedPowerDbm: null,
        linkMarginDb: null,
        predictedSignalQuality: "Unknown",
      }));
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    txPowerDbm,
    txAntennaGainDbi,
    rxAntennaGainDbi,
    frequencyMhz,
    distanceKm,
    receiverSensitivityDbm,
    model,
  ]);

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
              RF Engineering Intelligence Platform
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">ML Signal Intelligence</p>
        </motion.header>

        <DashboardNav />

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Signal Quality Classifier</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure link conditions and run backend-powered signal quality prediction.
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
                <span className="mb-1.5 block text-sm text-muted-foreground">Distance (km)</span>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(event) => handleNumberInput(setDistanceKm, event.target.value)}
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

              <label className="block sm:col-span-2">
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
                idleLabel="Run Signal Quality Prediction"
                busyLabel="Predicting..."
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Prediction Output</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Evaluated at distance {result.evaluatedDistanceKm} km using backend inference.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <ResultCard
                label="Received Power"
                value={formatDbm(result.receivedPowerDbm)}
                delay={0.05}
              />
              <ResultCard
                label="Link Margin"
                value={formatDb(result.linkMarginDb)}
                delay={0.1}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="mt-4 rounded-xl border border-border/50 bg-secondary/35 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Predicted Signal Quality
              </p>
              <div className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${qualityClasses(result.predictedSignalQuality)}`}>
                  {result.predictedSignalQuality}
                </span>
              </div>
            </motion.div>

            <p className="mt-4 text-sm text-muted-foreground">
              This prediction is generated using a trained Decision Tree classifier.
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
