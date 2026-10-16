"use client";

import { memo } from "react";
import { motion } from "framer-motion";

export default memo(function HeroHeader() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full py-10 sm:py-14 text-center overflow-hidden"
    >
      <div className="relative z-10 max-w-3xl mx-auto px-4 space-y-5">
        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-foreground">
            See the match{" "}
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent italic font-serif">
              ahead.
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
          Pick your teams. Explore the numbers.
        </motion.p>
      </div>
    </motion.section>
  );
});

