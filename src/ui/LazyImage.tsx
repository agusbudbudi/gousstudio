import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageOff } from 'lucide-react';

const LazyImage = ({ src, alt, className, style, ...props }: any) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-[var(--color-bg)] ${className || ''}`} style={style}>
      {/* Skeleton Loader */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-slate-800/40 flex items-center justify-center z-10"
      >
        <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
      </motion.div>

      {/* Error State */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-slate-300 z-20 p-4 border border-white/5 rounded-xl"
        >
          <ImageOff size={24} className="mb-2 opacity-50 text-red-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-center leading-relaxed">
            Preview failed to load<br/>
            <span className="opacity-60 font-medium normal-case">Please refresh page</span>
          </span>
        </motion.div>
      )}

      {/* Actual Image */}
      {!hasError && (
        <motion.img
          src={currentSrc}
          alt={alt || "Portfolio graphic"}
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          onLoad={handleLoad}
          onError={handleError}
          className="w-full h-auto object-cover"
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
