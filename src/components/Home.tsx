import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion } from 'motion/react';
import { useTimer } from '../hooks/useTimer';

interface HomeProps {
  onNext: () => void;
}

const START_DATE = new Date('2025-11-07T00:00:00+08:00');

export const Home: React.FC<HomeProps> = ({ onNext }) => {
  const { days, hours, minutes, seconds } = useTimer(START_DATE);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    const projection = d3.geoOrthographic()
      .scale(250)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath(projection, context);
    
    // Load world map for Earth texture
    let worldData: any;
    let land: any;
    
    d3.json('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
      .then(data => {
        worldData = data;
        if (worldData && worldData.objects && worldData.objects.countries) {
          // @ts-ignore
          land = topojson.feature(worldData, worldData.objects.countries);
        }
      })
      .catch(err => console.error("Earth texture failed to load", err));

    let rotation = 0;
    const render = () => {
      rotation += 0.2;
      projection.rotate([rotation, -15]);
      
      context.clearRect(0, 0, width, height);

      // Atmospheric glow around globe (outer)
      context.beginPath();
      context.arc(width/2, height/2, 260, 0, Math.PI * 2);
      const outerGlow = context.createRadialGradient(width/2, height/2, 250, width/2, height/2, 280);
      outerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      context.fillStyle = outerGlow;
      context.fill();

      // Sphere background (frost effect)
      context.beginPath();
      path({ type: 'Sphere' });
      const gradient = context.createRadialGradient(width/2 - 50, height/2 - 50, 50, width/2, height/2, 250);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.02)');
      context.fillStyle = gradient;
      context.fill();
      
      // Draw Land if loaded
      if (land) {
        context.beginPath();
        path(land);
        context.fillStyle = 'rgba(255, 255, 255, 0.15)';
        context.fill();
      }
      
      // Always draw grid lines for structure
      context.beginPath();
      path(d3.geoGraticule()());
      context.lineWidth = 0.5;
      context.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      context.stroke();

      // Sphere outline
      context.beginPath();
      path({ type: 'Sphere' });
      context.lineWidth = 1;
      context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      context.stroke();
    };

    const timer = d3.timer(render);
    return () => timer.stop();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ scale: 1.5, opacity: 0, rotate: 10 }}
      transition={{ duration: 1 }}
      className="relative w-full h-full flex flex-col items-center justify-center pointer-events-none"
    >
      {/* Timer Card */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-12 left-12 glass-card p-10 pointer-events-auto min-w-[480px]"
      >
        <p className="text-white/60 text-sm font-mono uppercase tracking-[0.3em] mb-4">The Universe Started</p>
        <div className="flex gap-4 items-baseline justify-between">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display text-glow">{days}</span>
            <span className="text-[11px] uppercase opacity-40 mt-1 font-mono tracking-widest">Days</span>
          </div>
          <span className="text-3xl opacity-10 font-thin">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display text-glow">{hours.toString().padStart(2, '0')}</span>
            <span className="text-[11px] uppercase opacity-40 mt-1 font-mono tracking-widest">Hrs</span>
          </div>
          <span className="text-3xl opacity-10 font-thin">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display text-glow">{minutes.toString().padStart(2, '0')}</span>
            <span className="text-[11px] uppercase opacity-40 mt-1 font-mono tracking-widest">Min</span>
          </div>
          <span className="text-3xl opacity-10 font-thin">:</span>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-display text-glow">{seconds.toString().padStart(2, '0')}</span>
            <span className="text-[11px] uppercase opacity-40 mt-1 font-mono tracking-widest">Sec</span>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] items-center text-white/20 flex gap-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            LIVE TIME STREAM
          </span>
          <p className="text-[11px] font-mono opacity-30 tracking-[0.2em]">SINCE 2025.11.07</p>
        </div>
      </motion.div>

      {/* Rotating Earth */}
      <motion.button
        onClick={onNext}
        className="relative pointer-events-auto group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={600} 
          className="drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="font-display text-2xl text-white/40 tracking-widest uppercase pointer-events-none">Explore</p>
        </div>
      </motion.button>
    </motion.div>
  );
};
