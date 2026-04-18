import React from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';

interface SplashProps {
  onNext: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onNext }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 flex flex-col items-center justify-between py-32 z-50 pointer-events-auto"
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.5, ease: "easeOut" }}
          className="font-display text-8xl md:text-9xl tracking-[0.15em] text-glow font-extralight"
        >
          Memory Universe
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-[1px] bg-white/5" />
          </div>
          <p className="text-white/40 text-lg font-mono tracking-[1em] mt-8 mb-8">⭐ & 🦎</p>
        </motion.div>
      </div>

      <motion.button
        onClick={onNext}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="group relative flex flex-col items-center gap-2 mb-12 transition-transform hover:scale-110 active:scale-95"
      >
        <p className="text-[10px] text-white/20 font-mono tracking-[0.3em] uppercase group-hover:text-white/40 transition-colors">Launch</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
        </motion.div>
      </motion.button>
    </motion.div>
  );
};
