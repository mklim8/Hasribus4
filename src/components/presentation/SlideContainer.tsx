import React, { useRef, useEffect, useState } from 'react';

interface SlideContainerProps {
  children: React.ReactNode;
  aspectRatio?: '16:9';
  className?: string;
}

export const SlideContainer: React.FC<SlideContainerProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.6);

  // 1920x1080 design canvas base dimensions
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const parentWidth = rect.width || containerRef.current.clientWidth || window.innerWidth - 64;
      const parentHeight = rect.height || containerRef.current.clientHeight || window.innerHeight - 240;

      const scaleX = (parentWidth - 24) / BASE_WIDTH;
      const scaleY = (parentHeight - 24) / BASE_HEIGHT;
      const newScale = Math.min(scaleX, scaleY, 1.1);

      setScale(Math.max(newScale, 0.2));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(() => {
      updateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-transparent ${className}`}>
      <div
        className="relative bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};
