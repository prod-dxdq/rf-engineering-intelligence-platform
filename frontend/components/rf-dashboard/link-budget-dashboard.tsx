"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AnalyzeButton } from "./analyze-button";
import { DashboardNav } from "./dashboard-nav";
import { SystemStatusPill } from "./system-status-pill";
import {
  buildLinkBudgetAnalyzeUrl,
  fetchLinkBudgetByUrl,
  parseLinkBudgetResults,
  type LinkBudgetInput,
  type LinkBudgetModel,
  type LinkBudgetResults,
} from "@/lib/rf-data";

const initialResults: LinkBudgetResults = {
  freeSpacePathLossDb: null,
  receivedPowerDbm: null,
  linkMarginDb: null,
};

const modelOptions: Array<{ value: LinkBudgetModel; label: string }> = [
  { value: "free_space", label: "Free Space" },
  { value: "urban", label: "Urban" },
  { value: "suburban", label: "Suburban" },
];

function formatModelLabel(model: LinkBudgetModel): string {
  const found = modelOptions.find((option) => option.value === model);
  return found?.label ?? "N/A";
}

interface ResultCardProps {
  title: string;
  value: number | null;
  unit: string;
  delay: number;
}

function ResultCard({ title, value, unit, delay }: ResultCardProps) {
  const valueLabel = value === null ? "N/A" : `${value.toFixed(2)} ${unit}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-xl border border-border/50 bg-secondary/35 p-4"
    >
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-semibold text-foreground">{valueLabel}</p>
    </motion.div>
  );
}

export function LinkBudgetDashboard() {
  const [txPowerDbm, setTxPowerDbm] = useState(30);
  const [txAntennaGainDbi, setTxAntennaGainDbi] = useState(10);
  const [rxAntennaGainDbi, setRxAntennaGainDbi] = useState(10);
  const [frequencyMhz, setFrequencyMhz] = useState(2400);
  const [distanceKm, setDistanceKm] = useState(1);
  const [receiverSensitivityDbm, setReceiverSensitivityDbm] = useState(-90);
  const [model, setModel] = useState<LinkBudgetModel>("free_space");
  const [results, setResults] = useState<LinkBudgetResults>(initialResults);
  const [selectedModel, setSelectedModel] = useState<LinkBudgetModel>("free_space");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNumberInput = useCallback((setter: (value: number) => void, rawValue: string) => {
    const parsedValue = Number(rawValue);
    setter(Number.isFinite(parsedValue) ? parsedValue : 0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const input: LinkBudgetInput = {
        txPowerDbm,
        txAntennaGainDbi,
        rxAntennaGainDbi,
        frequencyMhz,
        distanceKm,
        receiverSensitivityDbm,
        model,
      };

      // Build full request URL with all query parameters from the form state.
      const requestUrl = buildLinkBudgetAnalyzeUrl(input, "http://127.0.0.1:8000");
      const response = await fetchLinkBudgetByUrl(requestUrl);

      if (!response.ok) {
        throw new Error(`Backend link-budget analyze failed: ${response.status}`);
      }

      const payload = await response.json();
      setResults(parseLinkBudgetResults(payload));
      setSelectedModel(model);
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
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.2 240 / 0.4), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 290 / 0.4), transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-0 w-64 h-64 rounded-full blur-3xl opacity-10"
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
          className="text-center mb-8"
        >
          <SystemStatusPill />
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 text-balance">
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
          <p className="text-lg text-muted-foreground">Link Budget Planner</p>
        </motion.header>

        <DashboardNav />

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Link Inputs</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure transmitter, path, and receiver values, then run analysis.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  TX Power (dBm)
                </span>
                <input
                  type="number"
                  value={txPowerDbm}
                  onChange={(event) => handleNumberInput(setTxPowerDbm, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  TX Antenna Gain (dBi)
                </span>
                <input
                  type="number"
                  value={txAntennaGainDbi}
                  onChange={(event) =>
                    handleNumberInput(setTxAntennaGainDbi, event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  RX Antenna Gain (dBi)
                </span>
                <input
                  type="number"
                  value={rxAntennaGainDbi}
                  onChange={(event) =>
                    handleNumberInput(setRxAntennaGainDbi, event.target.value)
                  }
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  Frequency (MHz)
                </span>
                <input
                  type="number"
                  value={frequencyMhz}
                  onChange={(event) => handleNumberInput(setFrequencyMhz, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  Distance (km)
                </span>
                <input
                  type="number"
                  value={distanceKm}
                  onChange={(event) => handleNumberInput(setDistanceKm, event.target.value)}
                  className="h-10 w-full rounded-lg border border-border/60 bg-secondary/35 px-3 text-sm text-foreground outline-none transition focus:border-primary"
                />
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  Receiver Sensitivity (dBm)
                </span>
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
                <span className="mb-1.5 block text-sm text-muted-foreground">
                  Path Loss Model
                </span>
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
                idleLabel="Analyze Link Budget"
                busyLabel="Analyzing Link Budget..."
              />
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-border bg-card/95 p-6 backdrop-blur-sm"
          >
            <h2 className="text-lg font-semibold text-foreground">Analysis Results</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Results are fetched from the backend endpoint at 127.0.0.1:8000.
            </p>

            <div className="mt-4 rounded-lg border border-border/45 bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
              Selected Model: <span className="font-medium text-foreground">{formatModelLabel(selectedModel)}</span>
            </div>

            <div className="mt-5 grid gap-4">
              <ResultCard
                title="Free-Space Path Loss"
                value={results.freeSpacePathLossDb}
                unit="dB"
                delay={0.05}
              />
              <ResultCard
                title="Received Power"
                value={results.receivedPowerDbm}
                unit="dBm"
                delay={0.1}
              />
              <ResultCard
                title="Link Margin"
                value={results.linkMarginDb}
                unit="dB"
                delay={0.15}
              />
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
