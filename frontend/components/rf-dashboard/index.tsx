"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RFStageCard } from "./rf-stage-card";
import { SignalFlowArrow } from "./signal-flow-arrow";
import { ResultsPanel } from "./results-panel";
import { AnalyzeButton } from "./analyze-button";
import {
  rfStages,
  calculateReceiverChain,
  analyzeReceiverChain,
  type RFStage,
  type ReceiverChainResults,
} from "@/lib/rf-data";

export function RFDashboard() {
  const [stages, setStages] = useState<RFStage[]>(rfStages);
  const [results, setResults] = useState<ReceiverChainResults>(() =>
    calculateReceiverChain(rfStages)
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true);

    try {
      const newResults = await analyzeReceiverChain(stages);
      setResults(newResults);
    } finally {
      setIsAnalyzing(false);
    }
  }, [stages]);

  const handleStageMetricChange = useCallback(
    (stageId: string, field: "gain" | "noiseFigure" | "ip3", value: number) => {
      setStages((currentStages) =>
        currentStages.map((stage) =>
          stage.id === stageId ? { ...stage, [field]: value } : stage
        )
      );
    },
    []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
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

      {/* Grid pattern overlay */}
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

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{
                boxShadow: [
                  "0 0 4px 2px oklch(0.7 0.18 150 / 0.4)",
                  "0 0 8px 4px oklch(0.7 0.18 150 / 0.6)",
                  "0 0 4px 2px oklch(0.7 0.18 150 / 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              System Online
            </span>
          </motion.div>

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
          <p className="text-lg text-muted-foreground">
            Receiver Chain Simulator
          </p>
        </motion.header>

        {/* Signal Flow Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-6">
            <div
              className="w-1 h-6 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290))",
              }}
            />
            <h2 className="text-lg font-semibold text-foreground">
              Signal Chain Stages
            </h2>
          </div>

          {/* RF Stages with Flow Arrows */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0">
            {/* Input indicator */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-border/50"
            >
              <svg
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2v6m0 0l3-3m-3 3l-3-3" />
                <circle cx="12" cy="14" r="6" />
                <path d="M12 11v6m-3-3h6" />
              </svg>
              <span className="text-sm font-medium text-muted-foreground">
                RF Input
              </span>
            </motion.div>

            {/* Arrow to first stage (mobile hidden) */}
            <div className="hidden lg:block">
              <SignalFlowArrow index={0} />
            </div>

            {/* Stages */}
            {stages.map((stage, index) => (
              <div
                key={stage.id}
                className="flex flex-col lg:flex-row items-center"
              >
                <div className="w-full lg:w-64">
                  <RFStageCard
                    stage={stage}
                    index={index}
                    onMetricChange={handleStageMetricChange}
                  />
                </div>
                {index < stages.length - 1 && (
                  <>
                    {/* Mobile arrow (vertical) */}
                    <div className="lg:hidden py-2">
                      <motion.div
                        className="w-0.5 h-8 rounded-full"
                        style={{
                          background:
                            "linear-gradient(180deg, oklch(0.65 0.2 240), oklch(0.55 0.22 290))",
                        }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                    {/* Desktop arrow (horizontal) */}
                    <div className="hidden lg:block">
                      <SignalFlowArrow index={index + 1} />
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* Arrow to output (mobile hidden) */}
            <div className="hidden lg:block">
              <SignalFlowArrow index={stages.length} />
            </div>

            {/* Output indicator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-border/50"
            >
              <span className="text-sm font-medium text-muted-foreground">
                IF Output
              </span>
              <svg
                className="w-5 h-5 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 22v-6m0 0l3 3m-3-3l-3 3" />
                <circle cx="12" cy="10" r="6" />
                <path d="M9 10h6" />
              </svg>
            </motion.div>
          </div>
        </motion.section>

        {/* Results and Action Section */}
        <div className="space-y-6">
          <ResultsPanel results={results} isAnalyzing={isAnalyzing} />

          {/* Action button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center"
          >
            <AnalyzeButton onClick={handleAnalyze} isAnalyzing={isAnalyzing} />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mt-16 pt-8 border-t border-border/30 text-center"
        >
          <p className="text-xs text-muted-foreground">
            RF Engineering Intelligence Platform • Powered by Friis Cascade
            Analysis
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
