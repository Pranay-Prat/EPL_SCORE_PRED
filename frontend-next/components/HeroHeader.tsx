"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";

export default memo(function HeroHeader() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full pt-10 pb-12 sm:pt-16 sm:pb-16 text-center overflow-hidden"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-5">
        {/* Top League Badge Pill */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-foreground text-xs font-semibold tracking-wide backdrop-blur-sm">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Premier League, La Liga &amp; Champions League AI Predictor</span>
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-foreground">
            Predict Match Outcomes with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent italic font-serif">
              Precision
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          Select your teams across top European leagues. Uncover Poisson probability distributions, live form stats, and expected goals (xG).
        </motion.p>
      </div>
    </motion.section>
  );
});

