import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StackedGalleryProps {
  cityName: string;
}

export const StackedGallery: React.FC<StackedGalleryProps> = ({ cityName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [validImages, setValidImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // 获取 Vite 配置的 base 路径
    const baseUrl = import.meta.env.BASE_URL;

    // 生成预期的 10 张图片路径
    const potentialImages = Array.from({ length: 10 }, (_, i) => 
      `${baseUrl}data/${cityName}/${i + 1}.jpg`
    );

    const checkImages = async () => {
      const checks = potentialImages.map(src => {
        return new Promise<string | null>((resolve) => {
          const img = new Image();
          const encodedSrc = encodeURI(src); 
          
          img.onload = () => resolve(encodedSrc);
          img.onerror = () => resolve(null);
          img.src = encodedSrc;
        });
      });

      const results = await Promise.all(checks);
      const filtered = results.filter((r): r is string => r !== null);
      
      if (isMounted) {
        setValidImages(filtered);
        setCurrentIndex(0);
        setLoading(false);
      }
    };

    checkImages();

    return () => {
      isMounted = false;
    };
  }, [cityName]);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (validImages.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (validImages.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  if (loading) return <div className="h-48 flex items-center justify-center opacity-20 text-xs tracking-widest">LOADING GALLERY...</div>;
  if (validImages.length === 0) return null;

  return (
    <div className="relative h-[400px] w-full mt-4 mb-12 flex items-center justify-center">
      <div className="relative w-full h-full perspective-1000">
        <AnimatePresence mode="popLayout">
          {validImages.map((src, index) => {
            const distance = (index - currentIndex + validImages.length) % validImages.length;
            
            // 只渲染当前及后面两张，提升性能
            if (distance > 2) return null;

            return (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{
                  opacity: 1 - distance * 0.35,
                  scale: 1 - distance * 0.05,
                  x: distance * 12,
                  y: distance * -12,
                  zIndex: validImages.length - distance,
                }}
                exit={{ 
                  opacity: 0, 
                  x: -200, 
                  rotate: -8,
                  transition: { duration: 0.4, ease: "easeOut" } 
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                onClick={handleNext}
                className="absolute inset-0 cursor-pointer origin-bottom"
              >
                <div className="mx-auto w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white/5 backdrop-blur-sm shadow-black/50">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {validImages.length > 1 && (
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between items-center px-6">
          <div className="flex gap-6">
            <button onClick={handlePrev} className="group p-1">
              <ChevronLeft className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-all group-hover:-translate-x-0.5" />
            </button>
            <button onClick={handleNext} className="group p-1">
              <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono opacity-30 tracking-[0.2em]">
              {String(currentIndex + 1).padStart(2, '0')} / {String(validImages.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};