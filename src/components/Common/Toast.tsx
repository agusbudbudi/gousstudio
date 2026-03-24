import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useToast, ToastType } from '../../hooks/useToast';

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
}

const toastConfig = {
  success: {
    icon: <CheckCircle2 size={18} className="text-emerald-500" />,
    bg: 'bg-white/95',
    border: 'border-emerald-100/50',
    text: 'text-slate-700',
    progress: 'bg-emerald-500',
  },
  error: {
    icon: <AlertCircle size={18} className="text-rose-500" />,
    bg: 'bg-white/95',
    border: 'border-rose-100/50',
    text: 'text-slate-700',
    progress: 'bg-rose-500',
  },
  info: {
    icon: <Info size={18} className="text-blue-500" />,
    bg: 'bg-white/95',
    border: 'border-blue-100/50',
    text: 'text-slate-700',
    progress: 'bg-blue-500',
  },
  warning: {
    icon: <AlertTriangle size={18} className="text-amber-500" />,
    bg: 'bg-white/95',
    border: 'border-amber-100/50',
    text: 'text-slate-700',
    progress: 'bg-amber-500',
  },
};

const Toast: React.FC<ToastProps> = ({ id, type, message }) => {
  const { removeToast } = useToast();
  const config = toastConfig[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`min-w-[320px] max-w-md ${config.bg} backdrop-blur-md border ${config.border} p-4 rounded-xl shadow-lg shadow-black/5 flex items-start gap-3 relative overflow-hidden group mb-3`}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 pr-6">
        <p className={`text-sm font-semibold ${config.text} leading-tight`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => removeToast(id)}
        className="absolute top-4 right-3 text-slate-400 hover:text-slate-600 transition-colors p-1"
      >
        <X size={14} />
      </button>
      
      {/* Progress Bar Animation */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-1 ${config.progress} opacity-30`}
      />
    </motion.div>
  );
};

export default Toast;
