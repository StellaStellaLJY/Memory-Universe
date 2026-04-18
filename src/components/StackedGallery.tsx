import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface StackedGalleryProps {
  cityName: string;
}

export const StackedGallery: React.FC<StackedGalleryProps> = ({ cityName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 存储加载成功的图片索引
  const [validImages, setValidImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 初始化：生成可能的 10 张图片路径并进行预加载测试
  useEffect(() => {
    setLoading(true);
    const potentialImages = Array.from({ length: 10 }, (_, i) => 
      `/src/data/${cityName}/${i + 1}.jpg`
    );

    // 检查哪些图片是真实存在的
    const checkImages = async () => {
      const checks = potentialImages.map(src => {
        return new Promise<string | null>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => resolve(null);
          img.src = src;
        });
      });

      const results = await Promise.all(checks);
      const filtered = results.filter((r): r is string => r !== null);
      setValidImages(filtered);
      setCurrentIndex(0);
      setLoading(false);
    };

    checkImages();
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
  if (validImages.length === 0) return null; // 如果一张照片都没有，直接不显示

  return (
    /* 1. 增加外层容器高度从 h-56 变为 h-[400px] */
    <div className="relative h-[400px] w-full mt-4 mb-12 flex items-center justify-center">
      <div className="relative w-full h-full perspective-1000">
        <AnimatePresence mode="popLayout">
          {validImages.map((src, index) => {
            const distance = (index - currentIndex + validImages.length) % validImages.length;
            
            if (distance > 2) return null;

            return (
              <motion.div
                key={src}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{
                  opacity: 1 - distance * 0.35,
                  scale: 1 - distance * 0.05, // 稍微减小缩放差，保护比例视觉
                  x: distance * 12,
                  y: distance * -12, // 调整层叠高度
                  zIndex: validImages.length - distance,
                }}
                exit={{ 
                  opacity: 0, 
                  x: -200, // 增加滑出距离
                  rotate: -8,
                  transition: { duration: 0.4, ease: "easeOut" } 
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                onClick={handleNext}
                className="absolute inset-0 cursor-pointer origin-bottom"
              >
                {/* 2. 核心调整：添加 aspect-[3/4] 确保比例，并在高宽溢出时妥善处理 */}
                <div className="mx-auto w-[280px] aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-white/5 backdrop-blur-sm shadow-black/50">
                  <img
                    src={src}
                    alt=""
                    className="w-full h-full object-cover select-none"
                    loading="lazy"
                  />
                  {/* 装饰性渐变：让底部文字和操作更清晰 */}
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 底部控制栏稍微下移 */}
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