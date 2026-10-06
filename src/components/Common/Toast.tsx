import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToast, ToastType } from '../../hooks/useToast';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

// Ink toast (DESIGN.md §2.2): status color only on the icon and the timer bar,
// using the light tints that stay readable on ink.
const toastConfig = {
  success: { icon: CheckCircle2, iconClass: 'text-emerald-400', bar: 'bg-emerald-400' },
  error: { icon: AlertCircle, iconClass: 'text-rose-400', bar: 'bg-rose-400' },
  info: { icon: Info, iconClass: 'text-violet-300', bar: 'bg-violet-300' },
  warning: { icon: AlertTriangle, iconClass: 'text-amber-300', bar: 'bg-amber-300' },
};

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 5000 }) => {
  const { removeToast } = useToast();
  const reduceMotion = useReducedMotion();
  const config = toastConfig[type];
  const Icon = config.icon;
  const isUrgent = type === 'error' || type === 'warning';

  return (
    <motion.div
      layout={!reduceMotion}
      role={isUrgent ? 'alert' : 'status'}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative mb-2 flex w-[calc(100vw-2rem)] max-w-md items-start gap-3 overflow-hidden rounded-[14px] bg-ink py-3.5 pl-4 pr-11 text-paper sm:w-auto sm:min-w-[320px]"
    >
      <Icon size={18} className={`mt-px shrink-0 ${config.iconClass}`} aria-hidden />
      <p className="text-sm font-medium leading-snug">{message}</p>
      <button
        onClick={() => removeToast(id)}
        aria-label="Tutup notifikasi"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full text-paper/50 transition-colors hover:bg-paper/10 hover:text-paper"
      >
        <X size={14} />
      </button>

      {/* Time-left bar, synced to the toast duration. scaleX keeps it transform-only (DESIGN.md §6). */}
      {Number.isFinite(duration) && !reduceMotion && (
        <motion.div
          aria-hidden
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-0.5 w-full origin-left opacity-70 ${config.bar}`}
        />
      )}
    </motion.div>
  );
};

export default Toast;
