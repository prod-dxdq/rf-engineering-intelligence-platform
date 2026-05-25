"use client";

import { motion } from "framer-motion";

export function SystemStatusPill() {
  return (
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
      <span className="text-xs font-medium text-muted-foreground">System Online</span>
    </motion.div>
  );
}
