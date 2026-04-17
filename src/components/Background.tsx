import React from 'react';
import { motion } from 'motion/react';

export const Background: React.FC<{ page?: string }> = ({ page }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-cosmic-bg">
      {/* Stars Layer 1 - Larger Base Stars */}
      <div 
        className="absolute inset-0 animate-simple-pulse opacity-80"
        style={{
          backgroundImage: `radial-gradient(2.5px 2.5px at 20px 30px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2.5px 2.5px at 140px 170px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 250px 160px, #fff, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 100px 200px, #fff, rgba(0,0,0,0))`,
          backgroundSize: '300px 300px'
        }}
      />

      {/* Stars Layer 2 - Colorful Vivid Stars */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `radial-gradient(3.5px 3.5px at 50px 50px, #93c5fd, rgba(0,0,0,0)),
                            radial-gradient(4px 4px at 150px 250px, #fde68a, rgba(0,0,0,0)),
                            radial-gradient(3px 3px at 300px 100px, #f9a8d4, rgba(0,0,0,0)),
                            radial-gradient(2.5px 2.5px at 400px 400px, #c4b5fd, rgba(0,0,0,0))`,
          backgroundSize: '500px 500px'
        }}
      />

      {/* Animated Atmosphere Layers */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute -top-[10%] -left-[10%] w-[120%] h-[120%]"
        style={{
          background: 'radial-gradient(circle at 20% 30%, #1e1b4b 0%, transparent 50%), radial-gradient(circle at 80% 80%, #312e81 0%, transparent 60%)',
          filter: 'blur(130px)',
        }}
      />

      {/* Solar System Planets (Home Page Only) */}
      {page === 'home' && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Top Left Quadrant */}
          <Planet name="Neptune" color="from-blue-600/40 via-blue-500/30 to-blue-900/40" size="w-24 h-24" top="15%" left="10%" delay={0} />
          {/* Top Right Quadrant */}
          <Planet name="Jupiter" color="from-orange-200/40 via-yellow-100/30 to-orange-400/40" size="w-48 h-48" top="10%" left="70%" delay={2} />
          {/* Bottom Left Quadrant */}
          <Planet name="Saturn" color="from-yellow-100/40 via-orange-100/30 to-orange-300/40" size="w-40 h-40" top="65%" left="5%" delay={6} rings />
          {/* Bottom Right Quadrant */}
          <Planet name="Mars" color="from-red-500/40 via-orange-400/30 to-red-900/40" size="w-16 h-16" top="80%" left="75%" delay={4} />
          {/* Center-ish / Floating */}
          <Planet name="Uranus" color="from-cyan-300/40 via-blue-200/30 to-cyan-500/40" size="w-20 h-20" top="45%" left="40%" delay={8} />
          <Planet name="Venus" color="from-amber-200/40 via-yellow-100/30 to-amber-500/40" size="w-20 h-20" top="30%" left="85%" delay={10} />
          <Planet name="Mercury" color="from-gray-400/40 via-gray-300/30 to-gray-600/40" size="w-12 h-12" top="85%" left="30%" delay={12} />
        </div>
      )}
      
      {/* Subtle Starfield Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 50px 160px, #ddd, rgba(0,0,0,0)),
                            radial-gradient(2px 2px at 90px 40px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1.5px 1.5px at 130px 80px, #fff, rgba(0,0,0,0)),
                            radial-gradient(1px 1px at 160px 120px, #ddd, rgba(0,0,0,0))`,
          backgroundSize: '200px 200px'
        }}
      />
      
      {/* Dynamic Floating Glows */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]"
      />
    </div>
  );
};

const Planet = ({ name, color, size, top, left, delay, rings }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: [1, 1, 1],
      scale: 1, 
      x: [0, 30, 0], 
      y: [0, -40, 0],
      rotate: [0, 360]
    }}
    transition={{ 
      duration: 40 + delay * 2, 
      delay, 
      repeat: Infinity, 
      ease: "linear" 
    }}
    className={`absolute ${size} ${top} ${left} rounded-full blur-[0.5px] shadow-[0_0_60px_rgba(255,255,255,0.05)] overflow-visible`}
    style={{ zIndex: 5 }}
  >
    {rings && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240%] h-[20%] border border-white/10 rounded-[100%] rotate-[25deg] blur-[1px] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
    )}
    <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} shadow-inner`}>
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent)] opacity-60" />
      <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
    </div>
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/20 tracking-[0.3em] uppercase whitespace-nowrap">{name}</div>
  </motion.div>
);
