import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LazyImage = ({ src, alt, className, style, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-[var(--color-bg)] ${className || ''}`} style={style}>
      {/* Skeleton Loader */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isLoaded ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-slate-800/40 animate-pulse flex items-center justify-center"
      >
      </motion.div>

      {/* Actual Image */}
      <motion.img
        src={src}
        alt={alt || "Portfolio graphic"}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        onLoad={() => setIsLoaded(true)}
        className="w-full h-auto object-cover"
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default LazyImage;
