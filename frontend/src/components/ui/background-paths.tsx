"use client";

import * as React from "react";
import { motion } from "framer-motion";

// Number of paths to generate. Reducing this can improve performance.
const PATH_COUNT = 36;

function FloatingPaths({ position }: { position: number }) {
  const paths = React.useMemo(() => {
    return Array.from({ length: PATH_COUNT }, (_, i) => {
      const offsetX = i * 5 * position;
      const offsetY = i * 6;
      // Path definition: M P0 C P0 P1 P2 C P3 P4 P4
      // P0 = (-380 + offsetX, -189 - offsetY)
      // P1 = (-312 + offsetX,  216 - offsetY)
      // P2 = ( 152 + offsetX,  343 - offsetY)
      // P3 = ( 616 + offsetX,  470 - offsetY)
      // P4 = ( 684 + offsetX,  875 - offsetY)
      const d = `M ${-380 + offsetX} ${-189 - offsetY} C ${-380 + offsetX} ${
        -189 - offsetY
      } ${-312 + offsetX} ${216 - offsetY} ${152 + offsetX} ${
        343 - offsetY
      } C ${616 + offsetX} ${470 - offsetY} ${684 + offsetX} ${
        875 - offsetY
      } ${684 + offsetX} ${875 - offsetY}`;

      return {
        id: i,
        d: d,
        strokeWidthValue: 0.5 + i * 0.03,
        strokeOpacityValue: 0.1 + i * 0.03,
      };
    });
  }, [position]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.strokeWidthValue}
            strokeOpacity={path.strokeOpacityValue}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export function BackgroundPaths({
  title = "Background Paths",
}: { // It's good practice to define props interface separately for better readability
  title?: string;
}) {
  const words = title.split(" ");

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                        bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                        dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
        </motion.div>
      </div>
    </div>
  );
}
