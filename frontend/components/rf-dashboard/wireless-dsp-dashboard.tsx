"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { AnalyzeButton } from "./analyze-button";
import { BerVsSnrAnalysis } from "./ber-vs-snr-analysis";
import { DashboardNav } from "./dashboard-nav";
import { FFTSpectrumAnalysis } from "./fft-spectrum-analysis";
import { QPSKConstellationAnalysis } from "./qpsk-constellation-analysis";
import { SystemStatusPill } from "./system-status-pill";
import {
  analyzeWirelessDsp,
  type BerVsSnrPoint,
  type SpectrumDataPoint,
  type QpskConstellationPoint,
} from "@/lib/rf-data";

export function WirelessDSPDashboard() {
  const [spectrumData, setSpectrumData] = useState<SpectrumDataPoint[]>([]);
  const [qpskConstellation, setQpskConstellation] = useState<QpskConstellationPoint[]>([]);
  const [berVsSnr, setBerVsSnr] = useState<BerVsSnrPoint[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const results = await analyzeWirelessDsp();
      setSpectrumData(results.spectrumData);
      setQpskConstellation(results.qpskConstellation);
      setBerVsSnr(results.berVsSnr);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

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
          <p className="text-lg text-muted-foreground">Wireless / DSP Analysis</p>
        </motion.header>

        <DashboardNav />

        <div className="space-y-6">
          <FFTSpectrumAnalysis
            spectrumData={spectrumData}
            actionLabel="Analyze Wireless / DSP"
          />
          <QPSKConstellationAnalysis
            qpskConstellation={qpskConstellation}
            actionLabel="Analyze Wireless / DSP"
          />
          <BerVsSnrAnalysis
            berVsSnr={berVsSnr}
            actionLabel="Analyze Wireless / DSP"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-center"
          >
            <AnalyzeButton
              onClick={handleAnalyze}
              isAnalyzing={isAnalyzing}
              idleLabel="Analyze Wireless / DSP"
              busyLabel="Analyzing Wireless / DSP..."
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
