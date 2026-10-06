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
      onClick={onClick}
      className={`relative overflow-hidden rounded-[16px] border border-ink/10 bg-white transition-colors duration-200 ${
        onClick ? "cursor-pointer group" : ""
      } ${hoverEffect && onClick ? "hover:border-ink/25" : ""} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default CMSCard;
