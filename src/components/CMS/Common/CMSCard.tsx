import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface CMSCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

const CMSCard: React.FC<CMSCardProps> = ({
  children,
  className = "",
  onClick,
  hoverEffect = true,
  ...props
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={
        hoverEffect && onClick
          ? {
              y: -4,
              boxShadow:
                "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            }
          : undefined
      }
      onClick={onClick}
      className={`bg-white dark:bg-white/5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all relative overflow-hidden ${
        onClick ? "cursor-pointer group" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default CMSCard;
