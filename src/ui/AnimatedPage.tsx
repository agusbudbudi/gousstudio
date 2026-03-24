import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as any } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3, ease: 'easeIn' as any } },
};

const AnimatedPage = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
