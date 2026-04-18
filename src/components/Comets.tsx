import React from 'react';

// 定义彗星的配置数据，通过不同的参数模拟“随机性”
const COMET_CONFIGS = [
  { id: 1, width: '150px', top: '10%', delay: '0s', duration: '12s' },
  { id: 2, width: '200px', top: '30%', delay: '6s', duration: '18s' },
  { id: 3, width: '120px', top: '55%', delay: '25s', duration: '15s' },
  { id: 4, width: '250px', top: '75%', delay: '15s', duration: '20s' },
  // 你可以根据需要增加更多，CSS 驱动对数量不敏感
];

export const Comets: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {COMET_CONFIGS.map((config) => (
        <div
          key={config.id}
          className="comet"
          style={{
            width: config.width,
            top: config.top,
            /* 通过内联样式覆盖 CSS 的默认延迟和时长，制造差异 */
            animationDelay: config.delay,
            animationDuration: config.duration,
          }}
        />
      ))}
    </div>
  );
};