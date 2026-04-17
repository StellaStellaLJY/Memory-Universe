import React from 'react';
import { motion } from 'motion/react';

export type WeatherType = 'Clear' | 'Clouds' | 'Rain' | 'Snow' | 'Thunderstorm' | 'Drizzle' | null;

interface WeatherEffectProps {
  type: WeatherType;
}

export const WeatherEffect: React.FC<WeatherEffectProps> = ({ type }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden mix-blend-screen">
      {type === 'Clear' && (
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-500/20 blur-[150px] rounded-full"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/5 to-yellow-500/10" />
        </div>
      )}

      {type === 'Rain' && (
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 100 + '%' }}
              animate={{ y: '110vh' }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 2
              }}
              className="absolute w-[1px] h-10 bg-blue-400/30 blur-[1px]"
            />
          ))}
        </div>
      )}

      {type === 'Snow' && (
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -20, x: Math.random() * 100 + '%' }}
              animate={{ 
                y: '110vh',
                x: (Math.random() * 100 + (Math.sin(i) * 10)) + '%'
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 5
              }}
              className="absolute w-2 h-2 bg-white/40 rounded-full blur-[2px]"
            />
          ))}
        </div>
      )}

      {type === 'Clouds' && (
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '-100%', y: Math.random() * 60 + '%' }}
              animate={{ x: '110%' }}
              transition={{
                duration: 40 + Math.random() * 20,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 20
              }}
              className="absolute w-96 h-40 bg-white/5 blur-[80px] rounded-full"
            />
          ))}
        </div>
      )}

      {type === 'Thunderstorm' && (
        <motion.div
          animate={{ opacity: [0, 0, 0.5, 0, 0.8, 0, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.8, 0.85, 0.9, 0.95, 0.98, 1] }}
          className="absolute inset-0 bg-white/10"
        />
      )}

      {/* Subtle overlay color shift */}
      <div className={cn(
        "absolute inset-0 transition-colors duration-1000",
        type === 'Rain' && "bg-blue-900/10",
        type === 'Clear' && "bg-orange-500/5",
        type === 'Snow' && "bg-white/5",
        "opacity-50"
      )} />
    </div>
  );
};

// Helper function needed because it's used inside the component
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
